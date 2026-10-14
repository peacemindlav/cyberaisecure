import React, { useState } from 'react';
import { X, Copy, Check, FileText, Download, Terminal, FolderCheck } from 'lucide-react';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const templateContent = `---
title: "Your Blog Post Title Goes Here"
slug: "your-blog-post-title"
date: "${new Date().toISOString().split('T')[0]}"
excerpt: "A concise 120-160 character summary of this blog post for search engine snippets and social previews."
category: "Security Insights"
tags: ["Cybersecurity", "Best Practices", "Architecture"]
author: "CyberAiSecure Team"
readTime: "5 min read"
featured: true
draft: false
---

# Your Blog Post Title Goes Here

Write your opening paragraph here. Hook your readers with an executive overview of the challenge, concept, or technical architecture you are covering.

## Key Section Heading

Break your blog into clean, readable sections. Search engines index these subheadings to understand the hierarchy of your content.

- **Key Point 1:** Explain the primary security or technical factor.
- **Key Point 2:** Detail the practical implications.
- **Key Point 3:** Provide concrete takeaways for engineering teams.

### Technical Implementation & Code

You can include code snippets or terminal commands directly:

\`\`\`bash
# Example diagnostic command
sudo systemctl status security-audit
\`\`\`

\`\`\`python
# Example Python snippet
def verify_hash(payload: str) -> bool:
    import hashlib
    computed = hashlib.sha256(payload.encode()).hexdigest()
    return len(computed) == 64
\`\`\`

## Summary & Actionable Next Steps

Wrap up your blog with clear recommendations and conclusions.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(templateContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([templateContent], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = 'blog-template.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#0f141f] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col font-sans">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#d92338]" />
            <div>
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base">
                Markdown Blog Post Template (.md)
              </h2>
              <p className="text-[11px] font-mono text-slate-500">
                Drop .md files directly into <code>content/posts/</code> to publish
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-4 text-xs">
          {/* Instructions Card */}
          <div className="p-4 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-slate-800 dark:text-slate-200 space-y-2">
            <h4 className="font-bold flex items-center gap-1.5 text-xs text-[#d92338] dark:text-rose-400 font-mono">
              <FolderCheck className="w-4 h-4" />
              How to Publish Directly with Markdown
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
              <li>Copy the template below or duplicate <code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded">content/posts/blog-template.md</code>.</li>
              <li>Save it as a new file, for example: <code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded">content/posts/zero-trust-cloud.md</code>.</li>
              <li>Commit & push to your GitHub repo (<code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded">git push origin main</code>).</li>
              <li>The Vite build pipeline will automatically parse and publish your article live to <code className="font-mono">cyberaisecure.com</code>!</li>
            </ol>
          </div>

          {/* Template Code Viewer */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px]">
                content/posts/blog-template.md
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded bg-[#d92338] hover:bg-[#b81d2e] text-white font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Template'}</span>
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800 max-h-[45vh]">
              <code>{templateContent}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
