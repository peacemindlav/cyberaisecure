import React, { useState, useMemo } from 'react';
import { 
  X, Sparkles, CheckCircle2, AlertCircle, Copy, Check, 
  FileText, Globe, Code, ArrowRight, HelpCircle, Layers 
} from 'lucide-react';
import { Category, NewsArticle } from '../types';

interface CreateArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLocalArticle?: (article: NewsArticle) => void;
}

export const CreateArticleModal: React.FC<CreateArticleModalProps> = ({
  isOpen,
  onClose,
  onAddLocalArticle,
}) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState<Exclude<Category, 'All Stories'>>('Vulnerabilities');
  const [author, setAuthor] = useState('CyberAiSecure Research Team');
  const [source, setSource] = useState('CyberAiSecure Security Bulletin');
  const [cveId, setCveId] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [cvss, setCvss] = useState<string>('8.5');
  const [tagsInput, setTagsInput] = useState('Zero-Day, Cloud Security, Vulnerability, Defense');
  const [content, setContent] = useState(`### Executive Threat Overview\nProvide a technical explanation of the vulnerability or security architecture here.\n\n### Impacted Environments\n- Linux Kernel 6.x\n- Kubernetes Clusters v1.28+\n\n\`\`\`bash\n# Diagnostic command to audit system exposure\nsudo ss -tulpn | grep 443\n\`\`\`\n\n### Actionable Mitigation Steps\n1. Enforce strict egress network policies.\n2. Apply vendor hotfix immediately.`);

  const [copiedJson, setCopiedJson] = useState(false);
  const [addedDirectly, setAddedDirectly] = useState(false);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === autoSlug(title)) {
      setSlug(autoSlug(val));
    }
  };

  function autoSlug(str: string) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
  }

  // Calculate read time
  const readTime = useMemo(() => {
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  }, [content]);

  // SEO Score & Audits
  const seoAudit = useMemo(() => {
    const titleLen = title.trim().length;
    const summaryLen = summary.trim().length;
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const hasHeadings = content.includes('### ') || content.includes('## ');
    const hasCodeSnippet = content.includes('```');

    const checks = [
      {
        label: 'Title Length (Recommended: 40–60 characters for Google SERPs)',
        valid: titleLen >= 30 && titleLen <= 65,
        status: `${titleLen}/60 chars`,
      },
      {
        label: 'Meta Description (Recommended: 120–160 characters snippet)',
        valid: summaryLen >= 100 && summaryLen <= 165,
        status: `${summaryLen}/160 chars`,
      },
      {
        label: 'Content Depth (Recommended: 300+ words minimum)',
        valid: words >= 200,
        status: `${words} words`,
      },
      {
        label: 'Subheadings (H2/H3 for readability & search indexing)',
        valid: hasHeadings,
        status: hasHeadings ? 'Present' : 'Missing ### headers',
      },
      {
        label: 'Technical Evidence (Code snippet / command verification)',
        valid: hasCodeSnippet,
        status: hasCodeSnippet ? 'Formatted' : 'Consider adding ``` bash',
      },
    ];

    const score = Math.round((checks.filter(c => c.valid).length / checks.length) * 100);
    return { checks, score };
  }, [title, summary, content]);

  // Structured Article JSON
  const generatedArticle: NewsArticle = useMemo(() => {
    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    return {
      id: `cas-${Date.now().toString(36)}`,
      title: title || 'Untitled Cybersecurity Article',
      slug: slug || 'untitled-article',
      summary: summary || 'Article summary description for search engine result snippets.',
      category,
      publishedAt: 'Just now',
      readTime,
      author: author || 'CyberAiSecure Editorial Desk',
      source: source || 'CyberAiSecure',
      cveId: cveId ? cveId.trim() : undefined,
      severity: cveId ? severity : undefined,
      cvss: cveId && cvss ? parseFloat(cvss) : undefined,
      featured: true,
      tags: tags.length > 0 ? tags : ['Cybersecurity'],
      content,
    };
  }, [title, slug, summary, category, author, source, cveId, severity, cvss, tagsInput, content, readTime]);

  const jsonString = useMemo(() => {
    return JSON.stringify(generatedArticle, null, 2);
  }, [generatedArticle]);

  if (!isOpen) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handlePublishLocally = () => {
    if (onAddLocalArticle) {
      onAddLocalArticle(generatedArticle);
      setAddedDirectly(true);
      setTimeout(() => {
        setAddedDirectly(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0f141f] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col font-sans">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#d92338]" />
            <div>
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base">
                Create New SEO-Optimized Article
              </h2>
              <p className="text-[11px] font-mono text-slate-500">
                Live Google Search snippet preview & JSON generator
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
        <div className="overflow-y-auto p-6 space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* SEO Score Banner */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 block">SEO Readability Score</span>
              <span className={`text-2xl font-black ${
                seoAudit.score >= 80 ? 'text-emerald-500' : seoAudit.score >= 60 ? 'text-amber-500' : 'text-rose-500'
              }`}>
                {seoAudit.score}/100
              </span>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {seoAudit.checks.map((chk, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {chk.valid ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                  <span className="truncate">{chk.label}: <strong className="text-slate-900 dark:text-white">{chk.status}</strong></span>
                </div>
              ))}
            </div>
          </div>

          {/* SERP Search Result Snippet Preview */}
          <div className="p-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Google Search Result Snippet Preview
            </span>
            <div className="text-xs text-slate-500 font-mono truncate">
              https://cyberaisecure.com › posts › {slug || 'article-slug'}
            </div>
            <div className="text-base text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer truncate mt-0.5">
              {title || 'Your Article Title – Comprehensive Analysis | CyberAiSecure'}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
              {summary || 'Your meta description will appear here in Google search engine results pages. Keep it between 120 and 160 characters for maximum click-through rate.'}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2 space-y-1">
              <div className="flex justify-between items-center text-slate-900 dark:text-white font-semibold">
                <label>Article Headline (H1 & Title Tag)</label>
                <span className="text-[10px] font-mono text-slate-400">{title.length}/60 chars</span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Zero-Trust Kubernetes Hardening: Complete Enterprise Architecture Guide"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#d92338]"
              />
            </div>

            {/* URL Slug */}
            <div className="space-y-1">
              <label className="text-slate-900 dark:text-white font-semibold block">URL Slug (Permalink)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="zero-trust-kubernetes-hardening-guide"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#d92338]"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-slate-900 dark:text-white font-semibold block">Coverage Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#d92338]"
              >
                <option value="Vulnerabilities">Vulnerabilities</option>
                <option value="Malware">Malware</option>
                <option value="Data Breaches">Data Breaches</option>
                <option value="Cyber Warfare">Cyber Warfare</option>
                <option value="Cloud Security">Cloud Security</option>
                <option value="AI & LLM">AI & LLM</option>
              </select>
            </div>

            {/* Meta Description / Summary */}
            <div className="sm:col-span-2 space-y-1">
              <div className="flex justify-between items-center text-slate-900 dark:text-white font-semibold">
                <label>Meta Description / Executive Summary</label>
                <span className="text-[10px] font-mono text-slate-400">{summary.length}/160 chars</span>
              </div>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="A concise, high-impact summary summarizing the threat, root cause, and remediation steps (120–160 chars)."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#d92338]"
              />
            </div>

            {/* Author & Source */}
            <div className="space-y-1">
              <label className="text-slate-900 dark:text-white font-semibold block">Author Byline</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-900 dark:text-white font-semibold block">Primary Source / Advisory Reference</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* CVE ID (Optional) */}
            <div className="space-y-1">
              <label className="text-slate-900 dark:text-white font-semibold block">CVE ID (Optional)</label>
              <input
                type="text"
                value={cveId}
                onChange={(e) => setCveId(e.target.value)}
                placeholder="CVE-2026-XXXXX"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            {/* CVSS Score (Optional) */}
            <div className="space-y-1">
              <label className="text-slate-900 dark:text-white font-semibold block">CVSS v3.1 Score (Optional)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={cvss}
                onChange={(e) => setCvss(e.target.value)}
                placeholder="8.5"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            {/* Tags / Keywords */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-900 dark:text-white font-semibold block">Keywords & Tags (Comma-separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Kubernetes, Zero-Trust, eBPF, Cilium, Cloud Security"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Content (Markdown) */}
            <div className="sm:col-span-2 space-y-1">
              <div className="flex justify-between items-center text-slate-900 dark:text-white font-semibold">
                <label>Article Content (Supports Markdown, Headings ###, Code Blocks ```)</label>
                <span className="text-[10px] font-mono text-slate-400">{readTime}</span>
              </div>
              <textarea
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-xs font-mono text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:border-[#d92338]"
              />
            </div>
          </div>

          {/* Action Buttons: Instant Publish / Copy JSON */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleCopyJson}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedJson ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>JSON Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Article JSON</span>
                </>
              )}
            </button>

            <button
              onClick={handlePublishLocally}
              className="px-5 py-2 rounded-lg bg-[#d92338] hover:bg-[#b81d2e] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {addedDirectly ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Published to Live Feed!</span>
                </>
              ) : (
                <>
                  <span>Publish to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
