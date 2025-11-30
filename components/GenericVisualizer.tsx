
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyConcept } from '../types';
import { Network, GitBranch, Box, Database, Cpu, Activity, Zap } from 'lucide-react';

interface GenericVisualizerProps {
  concepts: KeyConcept[];
  theme: string;
}

const ICONS: Record<string, any> = {
  process: Activity,
  structure: Box,
  abstract: Network,
};

export const ConceptNetwork: React.FC<GenericVisualizerProps> = ({ concepts, theme }) => {
  const [activeId, setActiveId] = useState<number | null>(0);

  return (
    <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-sm border border-stone-200 my-8 w-full">
      <h3 className="font-serif text-2xl mb-2 text-stone-900">Key Concepts</h3>
      <p className="text-sm text-stone-500 mb-8 text-center max-w-md">
        Core mechanisms and structures extracted from the research analysis.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {concepts.map((concept, idx) => {
          const Icon = ICONS[concept.type] || Zap;
          const isActive = activeId === idx;
          
          return (
            <motion.div
              key={idx}
              onClick={() => setActiveId(idx)}
              className={`cursor-pointer rounded-xl p-6 border transition-all duration-300 relative overflow-hidden ${isActive ? 'border-stone-800 bg-stone-900 text-white shadow-lg scale-105 z-10' : 'border-stone-200 bg-[#F9F8F4] text-stone-600 hover:border-stone-400'}`}
              layoutId={`card-${idx}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${isActive ? 'bg-white/10 text-white' : 'bg-stone-200 text-stone-700'}`}>
                <Icon size={20} />
              </div>
              
              <h4 className={`font-serif text-lg font-bold mb-2 ${isActive ? 'text-white' : 'text-stone-800'}`}>
                {concept.title}
              </h4>
              
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-stone-300 leading-relaxed"
                  >
                    {concept.description}
                  </motion.p>
                )}
              </AnimatePresence>

              {!isActive && (
                 <p className="text-xs text-stone-400 line-clamp-2">{concept.description}</p>
              )}

              {/* Decorative background element for active card */}
              {isActive && (
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-white/5 to-white/20 rounded-full blur-2xl pointer-events-none"></div>
              )}
            </motion.div>
          );
        })}
      </div>
      
      <div className="mt-8 flex gap-2 justify-center">
         {concepts.map((_, i) => (
             <div key={i} className={`h-1 rounded-full transition-all duration-300 ${activeId === i ? 'w-8 bg-stone-800' : 'w-2 bg-stone-300'}`} />
         ))}
      </div>
    </div>
  );
};
