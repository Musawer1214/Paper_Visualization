
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { HeroScene, HardwareScene } from './components/DynamicScene';
import { SurfaceCodeDiagram, TransformerDecoderDiagram, PerformanceMetricDiagram } from './components/Diagrams';
import { ConceptNetwork } from './components/GenericVisualizer';
import { Navigation } from './components/Navigation';
import { InputModal } from './components/InputModal';
import { ArrowDown, Twitter, Linkedin, BookOpen } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { PaperData } from './types';
import { motion } from 'framer-motion';

// --- DEFAULT DATA (AlphaQubit) ---
const ALPHA_QUBIT_DATA: PaperData = {
  title: "AlphaQubit",
  subtitle: "AI for Quantum Error Correction",
  journal: "Nature • Nov 2024",
  introTitle: "The Noise Barrier",
  summary: "Building a large-scale quantum computer requires correcting the errors that inevitably arise in physical systems. The state of the art is the Surface Code. AlphaQubit uses machine learning to learn complex error patterns directly from the quantum processor, achieving accuracy far beyond human-designed algorithms.",
  authors: [
    { name: "Johannes Bausch", role: "Google DeepMind" },
    { name: "Andrew W. Senior", role: "Google DeepMind" },
    { name: "Francisco J. H. Heras", role: "Google DeepMind" },
    { name: "Thomas Edlich", role: "Google DeepMind" },
    { name: "Michael Newman", role: "Google Quantum AI" }
  ],
  theme: 'quantum',
  concepts: [], // Uses custom visualizations for demo
  impact: "AlphaQubit maintains its advantage even as the code distance increases. By learning from data directly, machine learning decoders can adapt to the unique quirks of each quantum processor, potentially reducing the hardware requirements for useful quantum computing.",
  url: "https://doi.org/10.1038/s41586-024-08148-8"
};

const AuthorCard = ({ name, role, delay }: { name: string, role: string, delay: string }) => {
  return (
    <div className="flex flex-col group animate-fade-in-up items-center p-8 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-xl transition-all duration-300 w-full max-w-xs hover:-translate-y-1" style={{ animationDelay: delay }}>
      <h3 className="font-serif text-2xl text-stone-900 dark:text-stone-100 text-center mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{name}</h3>
      <div className="w-12 h-0.5 bg-stone-300 dark:bg-stone-600 mb-4 opacity-60 group-hover:bg-stone-900 dark:group-hover:bg-stone-100 transition-colors"></div>
      <p className="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase tracking-widest text-center leading-relaxed">{role}</p>
    </div>
  );
};

// Helper to convert File to Base64 for Gemini
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  
  // State for Paper & Analysis
  const [paperData, setPaperData] = useState<PaperData>(ALPHA_QUBIT_DATA);
  const [isCustom, setIsCustom] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('uploading'); // uploading, reading, analyzing, generating
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Theme
  const [darkMode, setDarkMode] = useState(false);

  // Initialize Theme from LocalStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => () => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const shareContent = (platform: 'twitter' | 'linkedin') => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this interactive visualization of "${paperData.title}"! #Science #Research #Visualization`);
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    }
  };

  const handleAnalyze = async (text: string, file: File | null) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisStep('uploading');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let contentsPayload: any[] = [];
      const promptInstructions = `
        Analyze the provided research paper (text or PDF). 
        Extract fields in JSON:
        1. title (string)
        2. subtitle (string, 5-7 words)
        3. journal (string, optional)
        4. introTitle (string, catchy)
        5. summary (string, 2-3 paragraphs. IMPORTANT: Use \\n to separate paragraphs.)
        6. authors (array of {name, role})
        7. theme (enum: 'quantum', 'ai', 'biology', 'cosmos', 'material', 'general')
        8. concepts (array of 3 objects {title, description, type: 'process'|'structure'|'abstract'})
        9. impact (string, 1 paragraph)
      `;

      if (file) {
        setAnalysisStep('reading');
        const base64Data = await fileToBase64(file);
        contentsPayload.push({
          inlineData: { mimeType: 'application/pdf', data: base64Data }
        });
        contentsPayload.push({ text: promptInstructions + "\n\nUser Notes: " + text });
      } else {
        setAnalysisStep('reading');
        contentsPayload.push({ text: promptInstructions + "\n\nPaper Text:\n" + text.substring(0, 30000) });
      }

      setAnalysisStep('analyzing');
      // Artificial delay to make step visible if API is too fast (UX)
      await new Promise(r => setTimeout(r, 800));

      setAnalysisStep('generating');
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contentsPayload,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              journal: { type: Type.STRING },
              introTitle: { type: Type.STRING },
              summary: { type: Type.STRING },
              authors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { name: { type: Type.STRING }, role: { type: Type.STRING } }
                }
              },
              theme: { type: Type.STRING, enum: ['quantum', 'ai', 'biology', 'cosmos', 'material', 'general'] },
              concepts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                     title: { type: Type.STRING },
                     description: { type: Type.STRING },
                     type: { type: Type.STRING, enum: ['process', 'structure', 'abstract'] }
                  }
                }
              },
              impact: { type: Type.STRING }
            }
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      
      if (!data.title) throw new Error("Incomplete data received from AI.");

      // Ensure theme is valid
      const validTheme = ['quantum', 'ai', 'biology', 'cosmos', 'material'].includes(data.theme) ? data.theme : 'general';

      setPaperData({
        ...data,
        theme: validTheme,
        url: file ? "#" : "#"
      });
      setIsCustom(true);
      setShowInputModal(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (e: any) {
      console.error("Analysis failed", e);
      setAnalysisError("Failed to analyze the document. The PDF might be corrupted, too large, or password protected. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetToDemo = () => {
    setPaperData(ALPHA_QUBIT_DATA);
    setIsCustom(false);
    setShowInputModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-stone-900 text-stone-800 dark:text-stone-200 selection:bg-purple-200 dark:selection:bg-purple-900 selection:text-stone-900 transition-colors duration-500">
      
      <Navigation 
        scrolled={scrolled}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        isCustom={isCustom}
        paperData={paperData}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onNewPaper={() => setShowInputModal(true)}
      />

      <InputModal 
        show={showInputModal}
        onClose={() => setShowInputModal(false)}
        onAnalyze={handleAnalyze}
        onReset={resetToDemo}
        isAnalyzing={isAnalyzing}
        analysisStep={analysisStep}
        error={analysisError}
      />

      {/* Hero Section */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Dynamic Background with Rigging */}
        <HeroScene theme={paperData.theme} />
        
        {/* Gradient Overlay - Improved smoother gradient */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(249,248,244,0.7)_0%,rgba(249,248,244,0.8)_60%,rgba(249,248,244,1)_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(28,25,23,0.7)_0%,rgba(28,25,23,0.85)_60%,rgba(28,25,23,1)_100%)]" />

        <div className="relative z-10 container mx-auto px-6 text-center mt-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-block mb-6 px-4 py-1.5 border border-stone-300 dark:border-stone-700 text-stone-500 dark:text-stone-400 text-xs tracking-[0.25em] uppercase font-bold rounded-full backdrop-blur-sm bg-white/40 dark:bg-black/40 shadow-sm"
          >
            {paperData.journal || "Research Visualization"}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium leading-tight md:leading-[1.1] mb-8 text-stone-900 dark:text-stone-50 drop-shadow-sm max-w-6xl mx-auto"
          >
            {paperData.title} <br/>
            <span className="italic font-normal text-stone-600 dark:text-stone-400 text-3xl md:text-4xl block mt-6">{paperData.subtitle}</span>
          </motion.h1>
          
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 1, delay: 0.8 }}
             className="flex flex-col items-center gap-6"
          >
             {/* Social Sharing */}
             <div className="flex items-center gap-4">
                <button onClick={() => shareContent('twitter')} className="p-3 bg-white/60 dark:bg-stone-800/60 hover:bg-white dark:hover:bg-stone-700 rounded-full backdrop-blur-md transition-all text-stone-600 dark:text-stone-300 shadow-sm border border-stone-200 dark:border-stone-700 hover:scale-110">
                  <Twitter size={20} />
                </button>
                <button onClick={() => shareContent('linkedin')} className="p-3 bg-white/60 dark:bg-stone-800/60 hover:bg-white dark:hover:bg-stone-700 rounded-full backdrop-blur-md transition-all text-stone-600 dark:text-stone-300 shadow-sm border border-stone-200 dark:border-stone-700 hover:scale-110">
                  <Linkedin size={20} />
                </button>
             </div>

             <a onClick={scrollToSection('introduction')} className="group flex flex-col items-center gap-3 text-sm font-bold tracking-widest text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer mt-12 animate-bounce-slow">
                <span>SCROLL TO DISCOVER</span>
                <span className="p-3 border border-stone-300 dark:border-stone-700 rounded-full group-hover:border-stone-900 dark:group-hover:border-stone-200 transition-colors bg-white/30 dark:bg-black/30 backdrop-blur">
                    <ArrowDown size={18} />
                </span>
             </a>
          </motion.div>
        </div>
      </header>

      <main>
        {/* Introduction */}
        <section id="introduction" className="py-24 md:py-32 bg-white dark:bg-stone-900">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8 }}
            className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-16 items-start"
          >
            <div className="md:col-span-4 sticky top-32">
              <div className="inline-block mb-4 text-xs font-bold tracking-widest text-stone-500 dark:text-stone-400 uppercase">Introduction</div>
              <h2 className="font-serif text-4xl lg:text-5xl mb-8 leading-tight text-stone-900 dark:text-stone-100">{paperData.introTitle}</h2>
              <div className={`w-20 h-1 mb-6 rounded-full ${isCustom ? 'bg-stone-800 dark:bg-stone-600' : 'bg-[#C5A059]'}`}></div>
            </div>
            <div className="md:col-span-8 text-lg md:text-xl text-stone-600 dark:text-stone-300 leading-relaxed space-y-8 font-light">
               {paperData.summary.split('\n').filter(p => p.trim() !== "").map((para, i) => (
                 <p key={i} className="first-letter:text-5xl first-letter:font-serif first-letter:mr-2 first-letter:float-left first-letter:leading-none first-letter:mt-[-4px] text-stone-800 dark:text-stone-200">
                   {para}
                 </p>
               ))}
            </div>
          </motion.div>
        </section>

        {/* The Science / Analysis */}
        <section id="science" className="py-24 md:py-32 bg-stone-50 dark:bg-[#161412] border-t border-stone-200 dark:border-stone-800 relative">
            <div className="container mx-auto px-6 relative z-10">
               <div className="flex flex-col items-center mb-20">
                   <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-bold tracking-widest uppercase rounded-full mb-6 border border-stone-200 dark:border-stone-700 shadow-sm">
                      <BookOpen size={14}/> Analysis
                   </div>
                   <h2 className="font-serif text-4xl md:text-6xl text-stone-900 dark:text-stone-100 text-center">Core Mechanisms</h2>
               </div>

                {isCustom ? (
                  // Generic Visualizer for Custom Papers
                  <div className="max-w-6xl mx-auto">
                    <ConceptNetwork concepts={paperData.concepts} theme={paperData.theme} />
                  </div>
                ) : (
                  // Demo Specific Visualizers for AlphaQubit
                  <div className="space-y-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <h3 className="font-serif text-3xl mb-4 text-stone-900 dark:text-stone-100">The Surface Code</h3>
                            <div className="w-12 h-1 bg-nobel-gold mb-6"></div>
                            <p className="text-lg text-stone-600 dark:text-stone-300 mb-6 leading-relaxed">
                               Detecting errors without destroying quantum information requires auxiliary "Stabilizer Qubits" that measure parity checks. This lattice structure is the foundation of fault tolerance.
                            </p>
                        </div>
                        <div className="order-1 lg:order-2">
                           <SurfaceCodeDiagram />
                        </div>
                    </div>
                    
                    <div className="bg-stone-900 dark:bg-black rounded-3xl p-8 md:p-20 text-white relative overflow-hidden shadow-2xl">
                       <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(197,160,89,1)_0%,transparent_70%)] blur-3xl"></div>
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                            <div className="order-2 lg:order-1">
                                <TransformerDecoderDiagram />
                            </div>
                            <div className="order-1 lg:order-2">
                                <h3 className="font-serif text-3xl mb-4 text-white">Neural Decoding</h3>
                                <p className="text-lg text-stone-400 mb-6 leading-relaxed">
                                    AlphaQubit treats decoding as a sequence prediction problem. It uses a high-performance Recurrent Transformer to process the complex, noisy history of stabilizer measurements to predict the error.
                                </p>
                            </div>
                       </div>
                    </div>

                    <div className="max-w-5xl mx-auto text-center">
                         <h3 className="font-serif text-3xl mb-8 text-stone-900 dark:text-stone-100">Benchmarking Accuracy</h3>
                         <PerformanceMetricDiagram />
                    </div>
                  </div>
                )}
            </div>
        </section>

        {/* Impact */}
        <section id="impact" className="py-24 md:py-32 bg-[#F9F8F4] dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
             <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                <div className="lg:col-span-6 relative group">
                    <div className="aspect-square bg-white dark:bg-stone-950 rounded-2xl overflow-hidden relative border border-stone-200 dark:border-stone-800 shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]">
                        {(!isCustom || paperData.theme === 'quantum') ? (
                           <HardwareScene />
                        ) : (
                           <HeroScene theme={paperData.theme} />
                        )}
                        <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-stone-400 font-serif italic z-10 bg-black/50 backdrop-blur py-2 mx-12 rounded-full">
                          {isCustom ? "Visual Representation of Research Domain" : "Simulation of the Sycamore Processor environment"}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-6 flex flex-col justify-center">
                    <div className="inline-block mb-4 text-xs font-bold tracking-widest text-stone-500 dark:text-stone-400 uppercase">IMPACT</div>
                    <h2 className="font-serif text-4xl lg:text-5xl mb-8 text-stone-900 dark:text-stone-100">Future Implications</h2>
                    <p className="text-lg text-stone-600 dark:text-stone-300 mb-8 leading-relaxed">
                        {paperData.impact}
                    </p>
                    
                    <div className={`p-8 bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-2xl shadow-lg relative overflow-hidden`}>
                        <div className={`absolute left-0 top-0 bottom-0 w-2 ${isCustom ? 'bg-stone-900 dark:bg-stone-100' : 'bg-[#C5A059]'}`}></div>
                        <p className="font-serif italic text-xl md:text-2xl text-stone-800 dark:text-stone-200 mb-6 relative z-10">
                            "This research represents a significant step forward in our understanding of {paperData.theme === 'general' ? 'this field' : paperData.theme}, potentially accelerating the timeline for practical applications."
                        </p>
                        <span className="text-xs font-bold text-stone-400 dark:text-stone-500 tracking-wider uppercase">— AI Analysis Insight</span>
                    </div>
                </div>
             </div>
        </section>

        {/* Authors */}
        <section id="authors" className="py-24 bg-white dark:bg-[#161412] border-t border-stone-200 dark:border-stone-800">
           <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="inline-block mb-3 text-xs font-bold tracking-widest text-stone-500 dark:text-stone-400 uppercase">RESEARCH TEAM</div>
                    <h2 className="font-serif text-4xl md:text-5xl mb-4 text-stone-900 dark:text-stone-100">Key Contributors</h2>
                </div>
                
                <div className="flex flex-wrap justify-center gap-8">
                    {paperData.authors.map((author, idx) => (
                         <AuthorCard 
                            key={idx}
                            name={author.name} 
                            role={author.role} 
                            delay={`${idx * 0.1}s`} 
                        />
                    ))}
                </div>
           </div>
        </section>

      </main>

      <footer className="bg-stone-900 dark:bg-black text-stone-400 py-16 border-t border-stone-800">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
                <div className="text-white font-serif font-bold text-2xl mb-2 flex items-center gap-2 justify-center md:justify-start">
                   <div className="w-8 h-8 bg-stone-700 rounded-lg flex items-center justify-center text-sm">{paperData.title.charAt(0)}</div>
                   ScholarLens AI
                </div>
                <p className="text-sm opacity-60">Visualizing "{paperData.title}"</p>
            </div>
            <div className="flex gap-6 text-sm items-center">
                <button onClick={() => setShowInputModal(true)} className="hover:text-white transition-colors">Visualize New Paper</button>
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
        </div>
        <div className="text-center mt-12 text-xs text-stone-600 dark:text-stone-500 font-mono">
            Powered by Gemini 2.5 • React Three Fiber • Tailwind
        </div>
      </footer>
    </div>
  );
};

export default App;
