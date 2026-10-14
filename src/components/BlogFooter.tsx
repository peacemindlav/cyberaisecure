import React from 'react';
import { ShieldCheck, ArrowUp, FileCode } from 'lucide-react';

interface BlogFooterProps {
  onOpenTemplateModal: () => void;
}

export const BlogFooter: React.FC<BlogFooterProps> = ({ onOpenTemplateModal }) => {
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
              <span className="text-[10px] tracking-wider uppercase font-mono text-slate-400 mt-0.5">
                Official Blog
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <button
              onClick={onOpenTemplateModal}
              className="text-slate-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-[#d92338]" />
              <span>Markdown Template (.md)</span>
            </button>
            <span className="text-slate-600">·</span>
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
          <p>Static Blog Architecture on GitHub Pages</p>
        </div>
      </div>
    </footer>
  );
};
