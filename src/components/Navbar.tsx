import React, { useState } from 'react';
import { ShieldCheck, Sun, Moon, Search, Menu, X, Radio } from 'lucide-react';
import { Category } from '../types';

interface NavbarProps {
  currentCategory: Category;
  onSelectCategory: (category: Category) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  categories: readonly Category[];
  onOpenDeployGuide: () => void;
  onOpenCreateArticle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  isDark,
  onToggleTheme,
  categories,
  onOpenDeployGuide,
  onOpenCreateArticle,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#0c1017] border-b border-slate-200 dark:border-slate-800 transition-colors duration-150">
      {/* Top Threat Dispatch Bar */}
      <div className="bg-slate-900 text-slate-300 dark:bg-black dark:text-slate-400 text-xs py-1.5 px-4 font-mono flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-bold uppercase tracking-wide">STATUS:</span>
          <span className="text-slate-200 truncate">
            CyberAiSecure Publishing Pipeline Active · GitHub Pages Ready
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
          <span>cyberaisecure.com</span>
          <span>·</span>
          <button 
            onClick={onOpenDeployGuide} 
            className="text-cyan-400 hover:underline cursor-pointer"
          >
            Deploy Guide
          </button>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Brand Logo - CyberAiSecure */}
          <div 
            onClick={() => onSelectCategory('All Stories')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded bg-[#d92338] text-white flex items-center justify-center font-black text-sm tracking-tighter shadow-sm group-hover:bg-[#b81d2e] transition-colors">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white leading-none">
                CyberAi<span className="text-[#d92338] dark:text-rose-400">Secure</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                Cybersecurity News & Intel
              </span>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xs relative items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search CVE, malware, cloud..."
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md py-1.5 pl-9 pr-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 font-sans transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ×
              </button>
            )}
          </div>

          {/* Header Controls: New Article, Theme Toggle & Mobile Trigger */}
          <div className="flex items-center gap-2">
            {/* Create Article Button */}
            {onOpenCreateArticle && (
              <button
                onClick={onOpenCreateArticle}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#d92338] hover:bg-[#b81d2e] text-white text-xs font-semibold font-sans transition-colors cursor-pointer shadow-sm"
                title="Create SEO-Optimized Article"
              >
                <span>+ New Article</span>
              </button>
            )}

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              aria-label="Toggle search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Light / Dark Mode Toggle Button (Persistent with localStorage) */}
            <button
              onClick={onToggleTheme}
              className="p-2 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all cursor-pointer flex items-center gap-1.5"
              title={isDark ? "Switch to Light Theme (Default)" : "Switch to Dark Theme"}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden lg:inline text-xs font-mono font-medium">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="hidden lg:inline text-xs font-mono font-medium">Dark</span>
                </>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Expandable Bar */}
        {showSearchInput && (
          <div className="md:hidden py-2 border-t border-slate-200 dark:border-slate-800">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search news..."
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-900 dark:text-white"
            />
          </div>
        )}

        {/* Categories Bar (Editorial Tabs - Zero Pills, Clean Typography) */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-850 text-xs font-medium no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
                currentCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] px-4 py-3 space-y-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                onSelectCategory(cat);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm rounded ${
                currentCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => {
                onOpenDeployGuide();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-mono text-cyan-600 dark:text-cyan-400"
            >
              GitHub Pages Deployment Guide →
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
