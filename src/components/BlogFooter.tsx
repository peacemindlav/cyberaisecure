import React from 'react';
import { ShieldCheck, ArrowUp } from 'lucide-react';

export const BlogFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-slate-900 text-slate-400 dark:bg-black dark:text-slate-500 border-t border-slate-800 mt-20 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#d92338] text-white flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base tracking-tight leading-none">
                CyberAi<span className="text-[#d92338] dark:text-rose-400">Secure</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <button
              onClick={scrollToTop}
              className="text-slate-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Back to Top</span>
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <p>© {new Date().getFullYear()} CyberAiSecure. All rights reserved. · cyberaisecure.com</p>
          <div className="flex items-center gap-3">
            <a href="/privacy.html" className="text-slate-400 hover:text-white transition-colors">Privacy</a>
            <span className="text-slate-700">·</span>
            <a href="/terms.html" className="text-slate-400 hover:text-white transition-colors">Terms</a>
            <span className="text-slate-700">·</span>
            <a href="/about.html" className="text-slate-400 hover:text-white transition-colors">About</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
