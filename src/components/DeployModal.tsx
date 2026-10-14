import React, { useState } from 'react';
import { 
  X, Rocket, Copy, Check, Terminal, ExternalLink, 
  FolderTree, Globe, Sun, Moon, Database 
} from 'lucide-react';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployModal: React.FC<DeployModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const workflowYaml = `name: Deploy CyberAiSecure to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Dependencies
        run: npm install --legacy-peer-deps

      - name: Build Static Site
        run: npm run build

      - name: Prepare SPA Fallback & Domain
        run: |
          if [ -f public/CNAME ]; then cp public/CNAME dist/CNAME; fi
          cp dist/index.html dist/404.html

      - name: Upload Pages Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "./dist"

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0f141f] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-[#d92338]" />
            <h2 className="font-extrabold text-slate-900 dark:text-white text-base">
              GitHub Pages Static Deployment Architecture
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 text-xs font-sans text-slate-700 dark:text-slate-300">
          {/* 3 Core Architectures */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="font-bold font-mono text-slate-900 dark:text-white flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-500" />
                <span>Relative Paths (`./`)</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                Configured with <code>base: &apos;./&apos;</code> in <code>vite.config.ts</code> so assets load seamlessly on both custom domains (<code>domain.com/</code>) and GitHub subdirectories (<code>user.github.io/repo/</code>).
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="font-bold font-mono text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light by Default</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                Immediate head execution script checks <code>localStorage</code>. Defaults to crisp light editorial theme without flash of unstyled theme (FOUC).
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="font-bold font-mono text-slate-900 dark:text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-500" />
                <span>Zero Ads / API Ready</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                All mock ads stripped out. News stream loads from modular JSON (<code>public/data/news.json</code>) or any external API feed.
              </p>
            </div>
          </div>

          {/* GitHub Actions Workflow YAML */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold font-mono text-slate-900 dark:text-white uppercase text-[11px]">
                .github/workflows/deploy.yml (GitHub Pages CI/CD)
              </span>
              <button
                onClick={() => handleCopy(workflowYaml, 'yaml')}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] cursor-pointer"
              >
                {copiedKey === 'yaml' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Workflow</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
              <code>{workflowYaml}</code>
            </pre>
          </div>

          {/* Deployment Steps */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white font-mono uppercase text-[11px]">
              How to Deploy in 3 Steps
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-400 pl-1">
              <li>Commit & push all files to your repository&apos;s <code>main</code> branch.</li>
              <li>In your GitHub repo: Go to <strong>Settings → Pages</strong>.</li>
              <li>Under <strong>Build and deployment → Source</strong>, choose <strong>GitHub Actions</strong>.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
