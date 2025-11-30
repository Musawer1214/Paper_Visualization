
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Menu, X, Sun, Moon, Sparkles } from 'lucide-react';
import { PaperData } from '../types';

interface NavigationProps {
  scrolled: boolean;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  isCustom: boolean;
  paperData: PaperData;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onNewPaper: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  scrolled,
  menuOpen,
  setMenuOpen,
  isCustom,
  paperData,
  darkMode,
  toggleDarkMode,
  onNewPaper
}) => {
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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b ${scrolled ? 'bg-[#F9F8F4]/80 dark:bg-stone-900/80 backdrop-blur-md py-3 border-stone-200 dark:border-stone-800 shadow-sm' : 'bg-transparent py-6 border-transparent'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo Area */}
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-serif font-bold text-xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${isCustom ? 'bg-stone-800 dark:bg-stone-600' : 'bg-[#C5A059]'}`}>
            {paperData.title.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className={`font-serif font-bold text-lg tracking-wide transition-colors text-stone-900 dark:text-stone-100`}>
              {paperData.title.length > 15 ? paperData.title.substring(0, 15) + '...' : paperData.title.toUpperCase()}
            </span>
            <span className="font-sans font-medium text-[10px] text-stone-500 dark:text-stone-400 tracking-[0.2em] uppercase">
              ScholarLens AI
            </span>
          </div>
        </div>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-6 mr-6 border-r border-stone-200 dark:border-stone-700 pr-6 text-xs font-bold tracking-widest text-stone-500 dark:text-stone-400">
            <a href="#introduction" onClick={scrollToSection('introduction')} className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer uppercase py-2 border-b-2 border-transparent hover:border-stone-900 dark:hover:border-stone-200">Intro</a>
            <a href="#science" onClick={scrollToSection('science')} className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer uppercase py-2 border-b-2 border-transparent hover:border-stone-900 dark:hover:border-stone-200">Analysis</a>
            <a href="#impact" onClick={scrollToSection('impact')} className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer uppercase py-2 border-b-2 border-transparent hover:border-stone-900 dark:hover:border-stone-200">Impact</a>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors text-stone-600 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button 
              onClick={onNewPaper}
              className="group px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full hover:bg-stone-800 dark:hover:bg-stone-200 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 font-medium text-sm"
            >
              <Sparkles size={14} className="group-hover:text-purple-400 dark:group-hover:text-purple-600 transition-colors"/> 
              <span>New Paper</span>
            </button>
            
            {paperData.url && paperData.url !== '#' && (
              <a 
                href={paperData.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-5 py-2.5 bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-full hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors text-sm font-medium"
              >
                PDF
              </a>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-stone-900 dark:text-stone-100 p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 shadow-xl p-6 flex flex-col gap-6 animate-fade-in">
           <a href="#introduction" onClick={scrollToSection('introduction')} className="text-lg font-serif text-stone-800 dark:text-stone-200">Introduction</a>
           <a href="#science" onClick={scrollToSection('science')} className="text-lg font-serif text-stone-800 dark:text-stone-200">Analysis</a>
           <a href="#impact" onClick={scrollToSection('impact')} className="text-lg font-serif text-stone-800 dark:text-stone-200">Impact</a>
           <div className="h-[1px] bg-stone-100 dark:bg-stone-800"></div>
           <div className="flex items-center justify-between">
              <span className="text-stone-500">Theme</span>
              <button onClick={toggleDarkMode} className="flex items-center gap-2 text-stone-800 dark:text-stone-200">
                {darkMode ? <><Sun size={18}/> Light</> : <><Moon size={18}/> Dark</>}
              </button>
           </div>
           <button 
              onClick={() => { setMenuOpen(false); onNewPaper(); }}
              className="w-full py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-bold"
            >
              Visualize New Paper
            </button>
        </div>
      )}
    </nav>
  );
};
