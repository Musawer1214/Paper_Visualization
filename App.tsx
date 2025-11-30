
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { HeroScene, HardwareScene } from './components/DynamicScene';
import { SurfaceCodeDiagram, TransformerDecoderDiagram, PerformanceMetricDiagram } from './components/Diagrams';
import { ConceptNetwork } from './components/GenericVisualizer';
import { ArrowDown, Menu, X, BookOpen, Upload, Loader2, Sparkles, Plus } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { PaperData, PaperTheme } from './types';

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
    <div className="flex flex-col group animate-fade-in-up items-center p-8 bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 w-full max-w-xs hover:border-stone-900/30" style={{ animationDelay: delay }}>
      <h3 className="font-serif text-2xl text-stone-900 text-center mb-3">{name}</h3>
      <div className="w-12 h-0.5 bg-stone-300 mb-4 opacity-60 group-hover:bg-stone-900 transition-colors"></div>
      <p className="text-xs text-stone-500 font-bold uppercase tracking-widest text-center leading-relaxed">{role}</p>
    </div>
  );
};

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [paperData, setPaperData] = useState<PaperData>(ALPHA_QUBIT_DATA);
  const [isCustom, setIsCustom] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Analyze the following research paper text (abstract or summary). 
        Extract the following fields in JSON format:
        1. title (string)
        2. subtitle (string, short 5-7 words tagline)
        3. journal (string, e.g. "Nature • 2024", optional)
        4. introTitle (string, 2-3 words catchy title for introduction)
        5. summary (string, 2-3 paragraphs explaining the core problem and solution)
        6. authors (array of objects {name, role}) - if role unknown use "Researcher"
        7. theme (enum: 'quantum', 'ai', 'biology', 'cosmos', 'material', 'general') - pick best fit for visuals.
        8. concepts (array of 3 objects {title, description, type}) - type must be 'process', 'structure', or 'abstract'.
        9. impact (string, 1 paragraph on future implications)
        
        Text to analyze:
        ${inputText.substring(0, 10000)}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
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
      if (data.title) {
        setPaperData({
            ...data,
            url: "#"
        });
        setIsCustom(true);
        setShowInputModal(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {
      console.error("Analysis failed", e);
      alert("Could not analyze text. Please try again.");
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
    <div className="min-h-screen bg-[#F9F8F4] text-stone-800 selection:bg-stone-300 selection:text-stone-900">
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#F9F8F4]/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm pb-1 ${isCustom ? 'bg-stone-800' : 'bg-[#C5A059]'}`}>
              {paperData.title.charAt(0)}
            </div>
            <span className={`font-serif font-bold text-lg tracking-wide transition-opacity ${scrolled ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
              {paperData.title.toUpperCase()} <span className="font-normal text-stone-500 text-xs ml-2">SCHOLARLENS AI</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-stone-600">
            <a href="#introduction" onClick={scrollToSection('introduction')} className="hover:text-stone-900 transition-colors cursor-pointer uppercase">Introduction</a>
            <a href="#science" onClick={scrollToSection('science')} className="hover:text-stone-900 transition-colors cursor-pointer uppercase">Analysis</a>
            <a href="#impact" onClick={scrollToSection('impact')} className="hover:text-stone-900 transition-colors cursor-pointer uppercase">Impact</a>
            <button 
              onClick={() => setShowInputModal(true)}
              className="px-5 py-2 bg-stone-200 text-stone-800 rounded-full hover:bg-stone-300 transition-colors shadow-sm cursor-pointer flex items-center gap-2"
            >
              <Sparkles size={14} /> New Paper
            </button>
            {paperData.url !== '#' && (
              <a 
                href={paperData.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-5 py-2 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-colors shadow-sm cursor-pointer"
              >
                Original Paper
              </a>
            )}
          </div>

          <button className="md:hidden text-stone-900 p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Input Modal */}
      {showInputModal && (
        <div className="fixed inset-0 z-[60] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-[#F9F8F4]">
               <h3 className="font-serif text-2xl text-stone-900 flex items-center gap-2">
                 <Sparkles className="text-purple-600" size={24}/> Visualize Research
               </h3>
               <button onClick={() => setShowInputModal(false)} className="p-2 hover:bg-stone-200 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto">
              <p className="text-stone-600 mb-6">
                Paste the abstract or introduction of any research paper. Our AI will analyze the text, extract key concepts, and generate an interactive visualization tailored to the content's theme.
              </p>
              
              <textarea
                className="w-full h-64 p-4 rounded-xl border border-stone-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none font-mono text-sm bg-stone-50"
                placeholder="Paste paper abstract here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>

            <div className="p-6 border-t border-stone-100 bg-[#F9F8F4] flex justify-between items-center">
               <button 
                 onClick={resetToDemo}
                 className="text-stone-500 hover:text-stone-900 text-sm font-medium underline decoration-stone-300 underline-offset-4"
               >
                 View AlphaQubit Demo
               </button>
               
               <button 
                 onClick={handleAnalyze}
                 disabled={isAnalyzing || !inputText}
                 className={`px-8 py-3 rounded-full font-medium text-white shadow-lg transition-all flex items-center gap-2 ${isAnalyzing ? 'bg-stone-400 cursor-wait' : 'bg-stone-900 hover:bg-stone-800 hover:scale-105'}`}
               >
                 {isAnalyzing ? (
                   <><Loader2 className="animate-spin" size={18} /> Analyzing...</>
                 ) : (
                   <><Upload size={18} /> Generate Visualization</>
                 )}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden">
        <HeroScene theme={paperData.theme} />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(249,248,244,0.85)_0%,rgba(249,248,244,0.5)_50%,rgba(249,248,244,0.2)_100%)]" />

        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-block mb-4 px-3 py-1 border border-stone-300 text-stone-500 text-xs tracking-[0.2em] uppercase font-bold rounded-full backdrop-blur-sm bg-white/30">
            {paperData.journal || "Research Visualization"}
          </div>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium leading-tight md:leading-[1.1] mb-8 text-stone-900 drop-shadow-sm max-w-5xl mx-auto">
            {paperData.title} <br/>
            <span className="italic font-normal text-stone-600 text-3xl md:text-4xl block mt-6">{paperData.subtitle}</span>
          </h1>
          
          <div className="flex justify-center">
             <a href="#introduction" onClick={scrollToSection('introduction')} className="group flex flex-col items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors cursor-pointer mt-12">
                <span>DISCOVER</span>
                <span className="p-2 border border-stone-300 rounded-full group-hover:border-stone-900 transition-colors bg-white/50">
                    <ArrowDown size={16} />
                </span>
             </a>
          </div>
        </div>
      </header>

      <main>
        {/* Introduction */}
        <section id="introduction" className="py-24 bg-white">
          <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-4">
              <div className="inline-block mb-3 text-xs font-bold tracking-widest text-stone-500 uppercase">Introduction</div>
              <h2 className="font-serif text-4xl mb-6 leading-tight text-stone-900">{paperData.introTitle}</h2>
              <div className={`w-16 h-1 mb-6 ${isCustom ? 'bg-stone-800' : 'bg-[#C5A059]'}`}></div>
            </div>
            <div className="md:col-span-8 text-lg text-stone-600 leading-relaxed space-y-6">
               {/* Just a simple paragraph split for the summary */}
               {paperData.summary.split('\n').map((para, i) => (
                 <p key={i}>
                   {i === 0 && <span className={`text-5xl float-left mr-3 mt-[-8px] font-serif ${isCustom ? 'text-stone-900' : 'text-[#C5A059]'}`}>{para.charAt(0)}</span>}
                   {i === 0 ? para.slice(1) : para}
                 </p>
               ))}
            </div>
          </div>
        </section>

        {/* The Science / Analysis */}
        <section id="science" className="py-24 bg-white border-t border-stone-100">
            <div className="container mx-auto px-6">
               <div className="flex flex-col items-center mb-16">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 text-stone-600 text-xs font-bold tracking-widest uppercase rounded-full mb-6 border border-stone-200">
                      <BookOpen size={14}/> Analysis
                   </div>
                   <h2 className="font-serif text-4xl md:text-5xl text-stone-900 text-center">Core Mechanisms</h2>
               </div>

                {isCustom ? (
                  // Generic Visualizer for Custom Papers
                  <div className="max-w-5xl mx-auto">
                    <ConceptNetwork concepts={paperData.concepts} theme={paperData.theme} />
                  </div>
                ) : (
                  // Demo Specific Visualizers for AlphaQubit
                  <div className="space-y-24">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h3 className="font-serif text-3xl mb-4 text-stone-900">The Surface Code</h3>
                            <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                               Detecting errors without destroying quantum information requires auxiliary "Stabilizer Qubits" that measure parity checks.
                            </p>
                        </div>
                        <SurfaceCodeDiagram />
                    </div>
                    
                    <div className="bg-stone-900 rounded-3xl p-8 md:p-16 text-white relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.5)_0%,transparent_50%)]"></div>
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                            <div className="order-2 lg:order-1">
                                <TransformerDecoderDiagram />
                            </div>
                            <div className="order-1 lg:order-2">
                                <h3 className="font-serif text-3xl mb-4">Neural Decoding</h3>
                                <p className="text-lg text-stone-400 mb-6 leading-relaxed">
                                    AlphaQubit treats decoding as a sequence prediction problem, using a Recurrent Transformer to process stabilizer history.
                                </p>
                            </div>
                       </div>
                    </div>

                    <div className="max-w-4xl mx-auto text-center">
                         <h3 className="font-serif text-3xl mb-8 text-stone-900">Benchmarking Accuracy</h3>
                         <PerformanceMetricDiagram />
                    </div>
                  </div>
                )}
            </div>
        </section>

        {/* Impact */}
        <section id="impact" className="py-24 bg-[#F9F8F4] border-t border-stone-200">
             <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12">
                <div className="md:col-span-5 relative">
                    <div className="aspect-square bg-white rounded-xl overflow-hidden relative border border-stone-200 shadow-lg">
                        {/* Use Hardware Scene if Quantum, else Generic or Abstract */}
                        {(!isCustom || paperData.theme === 'quantum') ? (
                           <HardwareScene />
                        ) : (
                           <HeroScene theme={paperData.theme} />
                        )}
                        <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-stone-400 font-serif italic">
                          {isCustom ? "Visual Representation of Research Domain" : "Simulation of the Sycamore Processor environment"}
                        </div>
                    </div>
                </div>
                <div className="md:col-span-7 flex flex-col justify-center">
                    <div className="inline-block mb-3 text-xs font-bold tracking-widest text-stone-500 uppercase">IMPACT</div>
                    <h2 className="font-serif text-4xl mb-6 text-stone-900">Future Implications</h2>
                    <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                        {paperData.impact}
                    </p>
                    
                    <div className={`p-6 bg-white border border-stone-200 rounded-lg border-l-4 ${isCustom ? 'border-l-stone-900' : 'border-l-[#C5A059]'}`}>
                        <p className="font-serif italic text-xl text-stone-800 mb-4">
                            "This research represents a significant step forward in our understanding of {paperData.theme === 'general' ? 'this field' : paperData.theme}, potentially accelerating the timeline for practical applications."
                        </p>
                        <span className="text-sm font-bold text-stone-500 tracking-wider uppercase">— AI Analysis</span>
                    </div>
                </div>
             </div>
        </section>

        {/* Authors */}
        <section id="authors" className="py-24 bg-[#F5F4F0] border-t border-stone-300">
           <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="inline-block mb-3 text-xs font-bold tracking-widest text-stone-500 uppercase">RESEARCH TEAM</div>
                    <h2 className="font-serif text-3xl md:text-5xl mb-4 text-stone-900">Key Contributors</h2>
                </div>
                
                <div className="flex flex-wrap justify-center gap-6">
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

      <footer className="bg-stone-900 text-stone-400 py-16">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
                <div className="text-white font-serif font-bold text-2xl mb-2">ScholarLens AI</div>
                <p className="text-sm">Visualizing "{paperData.title}"</p>
            </div>
            <div className="flex gap-6 text-sm">
                <button onClick={() => setShowInputModal(true)} className="hover:text-white transition-colors">Visualize New Paper</button>
            </div>
        </div>
        <div className="text-center mt-12 text-xs text-stone-600">
            Powered by Gemini 2.5 • React Three Fiber
        </div>
      </footer>
    </div>
  );
};

export default App;
