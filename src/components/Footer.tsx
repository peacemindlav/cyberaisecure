import React from 'react';
import { ShieldCheck, ArrowUp, ExternalLink } from 'lucide-react';
import { Category } from '../types';

interface FooterProps {
  onSelectCategory: (category: Category) => void;
  categories: readonly Category[];
  onOpenDeployGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  categories,
  onOpenDeployGuide,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-slate-900 text-slate-400 dark:bg-black dark:text-slate-500 border-t border-slate-800 mt-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#d92338] text-white flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">
                CyberAi<span className="text-[#d92338] dark:text-rose-400">Secure</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Independent cybersecurity and threat intelligence portal tracking zero-days, vulnerabilities, data breaches, and AI security.
            </p>
            <div className="text-[11px] font-mono text-slate-500">
              Domain: <strong className="text-slate-300 font-normal">cyberaisecure.com</strong> · GitHub Pages Native
            </div>
          </div>

          {/* Categories Col */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-3">
              Coverage Channels
            </h4>
            <ul className="space-y-1.5 text-xs">
              {categories.slice(1, 6).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat);
                      scrollToTop();
                    }}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Architecture Col */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-3">
              Static Architecture
            </h4>
            <ul className="space-y-1.5 text-xs font-mono">
              <li>
                <button
                  onClick={onOpenDeployGuide}
                  className="hover:text-cyan-400 text-slate-300 transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>GitHub Pages Deploy Guide</span>
                </button>
              </li>
              <li>
                <a 
                  href="./data/news.json"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 text-slate-300 transition-colors flex items-center gap-1"
                >
                  <span>Public JSON Data Feed</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <span className="text-slate-500">Zero Ads / Zero Trackers</span>
              </li>
            </ul>
          </div>

          {/* Policies & Back to top */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-3">
              Editorial Standards
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              All CVE disclosures adhere to 90-day Coordinated Vulnerability Disclosure guidelines and ethical red-teaming standards.
            </p>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Back to Top</span>
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div>
            © {new Date().getFullYear()} CyberAiSecure. All rights reserved.
          </div>
          <div className="flex items-center gap-3">
            <span>Light Default Theme</span>
            <span>·</span>
            <span>Relative Assets (`base: &apos;./&apos;`)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
