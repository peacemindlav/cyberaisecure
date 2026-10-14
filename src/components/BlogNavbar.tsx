import React, { useState } from 'react';
import { ShieldCheck, Sun, Moon, Search, FileCode, Menu, X } from 'lucide-react';

interface BlogNavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenTemplateModal: () => void;
}

export const BlogNavbar: React.FC<BlogNavbarProps> = ({
  searchQuery,
  onSearchChange,
  isDark,
  onToggleTheme,
  onOpenTemplateModal,
}) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#0c1017]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-150">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <div 
            onClick={() => onSearchChange('')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded bg-[#d92338] text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:bg-[#b81d2e] transition-colors">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white leading-none">
                CyberAi<span className="text-[#d92338] dark:text-rose-400">Secure</span>
              </span>
              <span className="text-[11px] tracking-wider uppercase font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                Official Blog
              </span>
            </div>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xs relative items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search blog posts..."
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

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* View .md Template Button */}
            <button
              onClick={onOpenTemplateModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-mono transition-colors cursor-pointer"
              title="View & copy markdown blog template"
            >
              <FileCode className="w-3.5 h-3.5 text-[#d92338]" />
              <span className="hidden sm:inline">Blog Template (.md)</span>
            </button>

            {/* Mobile Search Icon */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              aria-label="Toggle search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="p-2 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all cursor-pointer flex items-center gap-1.5"
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
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
          </div>
        </div>

        {/* Mobile Search Drawer */}
        {showMobileSearch && (
          <div className="md:hidden py-2.5 border-t border-slate-100 dark:border-slate-800">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search blog posts..."
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-900 dark:text-white"
            />
          </div>
        )}
      </div>
    </header>
  );
};
