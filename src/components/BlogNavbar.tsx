import React, { useState } from 'react';
import { ShieldCheck, Sun, Moon, Search, ChevronDown, Menu, X, BookOpen } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogNavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  posts: BlogPost[];
  onSelectPost: (post: BlogPost) => void;
}

export const BlogNavbar: React.FC<BlogNavbarProps> = ({
  searchQuery,
  onSearchChange,
  isDark,
  onToggleTheme,
  categories,
  selectedCategory,
  onSelectCategory,
  posts,
  onSelectPost,
}) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [postsDropdownOpen, setPostsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#0c1017]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-150">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <div 
            onClick={() => {
              onSearchChange('');
              onSelectCategory('All');
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
          >
            <div className="w-9 h-9 rounded bg-[#d92338] text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:bg-[#b81d2e] transition-colors">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white leading-none">
                CyberAi<span className="text-[#d92338] dark:text-rose-400">Secure</span>
            </div>
          </div>

          {/* Dynamic Desktop Navigation: Categories & Recent Articles */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-mono">
            {categories.slice(0, 4).map(cat => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}

            {/* Quick Articles Dropdown in Nav Bar */}
            {posts.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setPostsDropdownOpen(!postsDropdownOpen)}
                  className="px-3 py-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#d92338]" />
                  <span>Articles ({posts.length})</span>
                  <ChevronDown className="w-3 h-3 ml-0.5" />
                </button>

                {postsDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-[#121824] rounded-lg border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                      Uploaded Markdown Posts
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {posts.map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            onSelectPost(p);
                            setPostsDropdownOpen(false);
                          }}
                          className="px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                        >
                          <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {p.title}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {p.date} · {p.category}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Desktop Search */}
          <div className="hidden lg:flex flex-1 max-w-xs relative items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search posts..."
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

          {/* Right Header Actions: Theme Toggle & Mobile Trigger */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Icon */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
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
                  <span className="hidden sm:inline text-xs font-mono font-medium">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="hidden sm:inline text-xs font-mono font-medium">Dark</span>
                </>
              )}
            </button>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Drawer */}
        {showMobileSearch && (
          <div className="lg:hidden py-2.5 border-t border-slate-100 dark:border-slate-800">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search posts..."
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-900 dark:text-white"
            />
          </div>
        )}

        {/* Mobile Nav Links */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase px-3 py-1">Categories</div>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
