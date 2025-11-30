
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyConcept } from '../types';
import { Network, Box, Activity, Zap, Search, X, Layers, Cpu, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface GenericVisualizerProps {
  concepts: KeyConcept[];
  theme: string;
}

// Visual configuration for different concept types
const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; border: string; label: string }> = {
  process: { 
      icon: Activity, 
      color: 'text-amber-600 dark:text-amber-400', 
      bg: 'bg-amber-100 dark:bg-amber-900/30', 
      border: 'border-amber-200 dark:border-amber-800',
      label: 'Process'
  },
  structure: { 
      icon: Box, 
      color: 'text-blue-600 dark:text-blue-400', 
      bg: 'bg-blue-100 dark:bg-blue-900/30', 
      border: 'border-blue-200 dark:border-blue-800',
      label: 'Structure'
  },
  abstract: { 
      icon: Network, 
      color: 'text-purple-600 dark:text-purple-400', 
      bg: 'bg-purple-100 dark:bg-purple-900/30', 
      border: 'border-purple-200 dark:border-purple-800',
      label: 'Abstract'
  },
};

const FallbackConfig = { icon: Zap, color: 'text-stone-600', bg: 'bg-stone-100', border: 'border-stone-200', label: 'Concept' };

export const ConceptNetwork: React.FC<GenericVisualizerProps> = ({ concepts, theme }) => {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConcepts = useMemo(() => {
    if (!searchTerm) return concepts;
    return concepts.filter(c => 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [concepts, searchTerm]);

  const clearSearch = () => setSearchTerm("");

  return (
    <div className="flex flex-col items-center p-8 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 my-8 w-full transition-all duration-500">
      
      {/* Header & Search Section */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center w-full mb-10 gap-6 border-b border-stone-100 dark:border-stone-700 pb-6">
        <div>
           <h3 className="font-serif text-3xl mb-2 text-stone-900 dark:text-stone-100 flex items-center gap-2">
             <Layers className="text-stone-400" size={24}/> Key Concepts
           </h3>
           <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md leading-relaxed">
             Explore the core mechanisms and theoretical structures extracted from the research. Click cards to expand details.
           </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-auto min-w-[300px] group">
           <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${searchTerm ? 'text-stone-800 dark:text-stone-200' : 'text-stone-400'}`} size={18} />
           <input 
             type="text" 
             placeholder="Filter concepts by keyword..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-12 pr-10 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 rounded-xl text-sm outline-none focus:border-stone-400 dark:focus:border-stone-500 focus:ring-2 focus:ring-stone-100 dark:focus:ring-stone-800 transition-all text-stone-800 dark:text-stone-200 shadow-sm group-hover:shadow-md"
           />
           {searchTerm && (
             <button 
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full transition-colors text-stone-500"
             >
               <X size={14} />
             </button>
           )}
           {searchTerm && (
              <div className="absolute -bottom-6 right-0 text-xs font-medium text-stone-400 animate-fade-in">
                  Found {filteredConcepts.length} result{filteredConcepts.length !== 1 ? 's' : ''}
              </div>
           )}
        </div>
      </div>

      {/* Grid */}
      <motion.div 
        layout 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full min-h-[300px] content-start"
      >
        <AnimatePresence mode='popLayout'>
        {filteredConcepts.map((concept, idx) => {
          const config = TYPE_CONFIG[concept.type] || FallbackConfig;
          const Icon = config.icon;
          const isActive = activeId === idx;
          
          return (
            <motion.div
              layout
              key={concept.title}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onClick={() => setActiveId(isActive ? null : idx)}
              className={`cursor-pointer rounded-xl p-6 border-2 transition-all duration-300 relative overflow-hidden flex flex-col group ${isActive ? `border-stone-800 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 shadow-2xl scale-[1.02] z-10` : `border-transparent bg-stone-50 dark:bg-stone-900/50 hover:bg-white dark:hover:bg-stone-800 hover:shadow-lg border-stone-200 dark:border-stone-700`}`}
            >
              <div className="flex justify-between items-start mb-4">
                  {/* Icon Badge */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${isActive ? 'bg-stone-800 dark:bg-stone-200' : config.bg}`}>
                    <Icon size={22} className={isActive ? 'text-white dark:text-stone-900' : config.color} />
                  </div>
                  
                  {/* Type Label */}
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${isActive ? 'border-stone-700 text-stone-400' : `${config.border} ${config.color.split(' ')[0]} bg-white dark:bg-transparent`}`}>
                      {config.label}
                  </div>
              </div>
              
              <h4 className={`font-serif text-xl font-bold mb-3 pr-8 transition-colors ${isActive ? 'text-white dark:text-stone-900' : 'text-stone-800 dark:text-stone-100'}`}>
                {concept.title}
              </h4>
              
              <div className="relative">
                  <AnimatePresence initial={false}>
                    {isActive ? (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            <p className={`text-sm leading-relaxed ${isActive ? 'text-stone-300 dark:text-stone-600' : 'text-stone-600 dark:text-stone-400'}`}>
                                {concept.description}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-0 left-0 w-full"
                        >
                            <p className="text-xs text-stone-500 dark:text-stone-500 line-clamp-2 leading-relaxed">
                                {concept.description}
                            </p>
                        </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Spacer to prevent layout collapse when collapsed (matches line-clamp-2 height roughly) */}
                  {!isActive && <div className="h-8"></div>}
              </div>

              {/* Expand Indicator */}
              <div className={`absolute bottom-4 right-4 transition-transform duration-300 ${isActive ? 'rotate-180 text-stone-500' : 'text-stone-300 group-hover:text-stone-800 dark:group-hover:text-stone-200'}`}>
                  <ChevronDown size={18} />
              </div>
            </motion.div>
          );
        })}
        </AnimatePresence>

        {filteredConcepts.length === 0 && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }}
             className="col-span-full py-16 flex flex-col items-center justify-center text-stone-400 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-xl"
            >
              <Search size={32} className="mb-4 opacity-50"/>
              <p className="text-lg font-medium text-stone-500 dark:text-stone-400">No concepts found</p>
              <p className="text-sm">Try adjusting your search for "{searchTerm}"</p>
              <button onClick={clearSearch} className="mt-4 px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-full text-xs font-bold uppercase hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                  Clear Search
              </button>
           </motion.div>
        )}
      </motion.div>
    </div>
  );
};
