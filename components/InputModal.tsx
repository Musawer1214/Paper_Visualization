
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useState } from 'react';
import { X, Upload, FileText, Trash2, Sparkles, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface InputModalProps {
  show: boolean;
  onClose: () => void;
  onAnalyze: (text: string, file: File | null) => void;
  onReset: () => void;
  isAnalyzing: boolean;
  analysisStep: string; // 'uploading' | 'reading' | 'analyzing' | 'generating'
  error: string | null;
}

export const InputModal: React.FC<InputModalProps> = ({ 
  show, 
  onClose, 
  onAnalyze, 
  onReset,
  isAnalyzing, 
  analysisStep,
  error
}) => {
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!show) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    validateAndSetFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file?: File) => {
    if (file) {
        if (file.type === 'application/pdf') {
          setSelectedFile(file);
        } else {
          alert("Please upload a PDF file.");
        }
      }
  };

  // Loading Screen View
  if (isAnalyzing) {
    const steps = [
        { id: 'uploading', label: 'Processing Document' },
        { id: 'reading', label: 'Extracting Text & Figures' },
        { id: 'analyzing', label: 'Identifying Key Concepts' },
        { id: 'generating', label: 'Constructing Visualization' }
    ];
    
    // Find current step index
    const currentStepIdx = steps.findIndex(s => s.id === analysisStep);
    // Calculate progress (approximate based on steps)
    const progressPercentage = Math.max(5, ((currentStepIdx + 0.5) / steps.length) * 100);

    return (
        <div className="fixed inset-0 z-[60] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md p-8 flex flex-col items-center text-center border border-stone-200 dark:border-stone-800">
                <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mb-6 relative">
                    <Sparkles className="text-purple-600 animate-pulse" size={32} />
                    <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full animate-spin-slow"></div>
                </div>
                
                <h3 className="font-serif text-2xl text-stone-900 dark:text-stone-100 mb-2">Analyzing Research</h3>
                <p className="text-stone-500 dark:text-stone-400 text-sm mb-8">Please wait while our AI decodes the paper.</p>
                
                <div className="w-full space-y-4 mb-6">
                    {steps.map((step, idx) => {
                        const isComplete = idx < currentStepIdx;
                        const isCurrent = idx === currentStepIdx;
                        
                        return (
                            <div key={step.id} className={`flex items-center gap-3 w-full transition-opacity duration-300 ${idx > currentStepIdx ? 'opacity-40' : 'opacity-100'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${isComplete ? 'bg-green-500 text-white' : isCurrent ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-stone-100 dark:bg-stone-800 text-stone-300'}`}>
                                    {isComplete ? <CheckCircle2 size={14} /> : isCurrent ? <Loader2 size={14} className="animate-spin"/> : <div className="w-2 h-2 rounded-full bg-current opacity-50"/>}
                                </div>
                                <span className={`text-sm font-medium transition-colors ${isComplete || isCurrent ? 'text-stone-800 dark:text-stone-200' : 'text-stone-400 dark:text-stone-600'}`}>
                                    {step.label}
                                </span>
                            </div>
                        )
                    })}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-purple-600 dark:bg-purple-500 transition-all duration-700 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                <p className="mt-3 text-xs text-stone-400 font-mono">{Math.round(progressPercentage)}% Complete</p>
            </div>
        </div>
    );
  }

  // Input Form View
  return (
    <div className="fixed inset-0 z-[60] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-stone-200 dark:border-stone-800 transform transition-all">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-[#F9F8F4] dark:bg-stone-950">
           <h3 className="font-serif text-2xl text-stone-900 dark:text-stone-100 flex items-center gap-2">
             <Sparkles className="text-purple-600" size={24}/> Visualize Research
           </h3>
           <button onClick={onClose} className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full transition-colors text-stone-600 dark:text-stone-400"><X size={20}/></button>
        </div>
        
        <div className="p-8 flex-1 overflow-y-auto bg-white dark:bg-stone-900 scrollbar-thin">
          <p className="text-stone-600 dark:text-stone-300 mb-6 text-sm leading-relaxed">
            Upload a full PDF research paper or paste an abstract. Our AI will analyze the entire document to extract key insights, themes, and visualizations.
          </p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-300">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <div className="text-sm">{error}</div>
            </div>
          )}
          
          {/* File Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`mb-6 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${isDragOver ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10 scale-[1.02]' : ''} ${selectedFile ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
          >
            <input 
              type="file" 
              accept="application/pdf" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileSelect}
            />
            
            {selectedFile ? (
               <div className="flex flex-col items-center gap-2 animate-fade-in">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-2 shadow-sm">
                     <FileText size={24} />
                  </div>
                  <span className="font-medium text-stone-900 dark:text-stone-100">{selectedFile.name}</span>
                  <span className="text-xs text-stone-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  <button 
                    onClick={(e) => {
                       e.stopPropagation();
                       setSelectedFile(null);
                       if(fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="mt-2 text-xs flex items-center gap-1 text-red-500 hover:text-red-700 py-1.5 px-3 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                     <Trash2 size={12}/> Remove File
                  </button>
               </div>
            ) : (
               <>
                  <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 text-stone-500 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                     <Upload size={24} />
                  </div>
                  <h4 className="font-bold text-stone-800 dark:text-stone-200 mb-1">Click or Drag PDF Here</h4>
                  <p className="text-xs text-stone-500">Supported format: .pdf (Max 10MB)</p>
               </>
            )}
          </div>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-stone-200 dark:border-stone-700"></div>
            <span className="flex-shrink-0 mx-4 text-stone-400 text-[10px] uppercase font-bold tracking-widest">OR PASTE TEXT</span>
            <div className="flex-grow border-t border-stone-200 dark:border-stone-700"></div>
          </div>

          <textarea
            className="w-full h-32 p-4 rounded-xl border border-stone-300 dark:border-stone-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 outline-none resize-none font-mono text-sm bg-stone-50 dark:bg-stone-950 dark:text-stone-200 transition-colors placeholder:text-stone-400"
            placeholder={selectedFile ? "Add optional context, instructions, or specific areas to focus on..." : "Paste paper abstract, introduction, or full text here..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        <div className="p-6 border-t border-stone-100 dark:border-stone-800 bg-[#F9F8F4] dark:bg-stone-950 flex justify-between items-center">
           <button 
             onClick={onReset}
             className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 text-sm font-medium underline decoration-stone-300 dark:decoration-stone-700 underline-offset-4 transition-colors"
           >
             Load Demo (AlphaQubit)
           </button>
           
           <button 
             onClick={() => onAnalyze(inputText, selectedFile)}
             disabled={(!inputText && !selectedFile)}
             className={`px-8 py-3 rounded-full font-medium text-white shadow-lg transition-all flex items-center gap-2 ${(!inputText && !selectedFile) ? 'bg-stone-300 dark:bg-stone-700 cursor-not-allowed opacity-70' : 'bg-stone-900 dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 hover:scale-105 shadow-xl'}`}
           >
             <Sparkles size={18} /> Visualize
           </button>
        </div>
      </div>
    </div>
  );
};
