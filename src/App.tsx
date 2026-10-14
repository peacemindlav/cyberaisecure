/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { BlogNavbar } from './components/BlogNavbar';
import { BlogCard } from './components/BlogCard';
import { BlogReader } from './components/BlogReader';
import { TemplateModal } from './components/TemplateModal';
import { BlogFooter } from './components/BlogFooter';
import { loadAllMarkdownPosts } from './utils/markdownLoader';
import { BlogPost } from './types';
import { FileCode, Sparkles, Plus, BookOpen, Mail, CheckCircle2, ArrowRight } from 'lucide-react';

export default function App() {
  // Theme Management: Light by Default, Persistent with localStorage
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem('cas_theme');
      return savedTheme === 'dark';
    } catch {
      return false; // Default to Light mode
    }
  });

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [templateModalOpen, setTemplateModalOpen] = useState<boolean>(false);

  // Newsletter states
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);

  const GOOGLE_FORM_ACTION_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScirOBi5wCJFF9Qk5G9p6aM5sElrPOAdGiteDt0ng6g6oH9Xw/formResponse';
  const GOOGLE_FORM_EMAIL_ENTRY_ID = 'entry.349413289';

  // Apply dark class to <html> root whenever theme changes and save to localStorage
  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('cas_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('cas_theme', 'light');
      }
    } catch {}
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Load all markdown files directly from content/posts/*.md
  useEffect(() => {
    const mdPosts = loadAllMarkdownPosts();
    setPosts(mdPosts);
  }, []);

  // Sync with browser URL / history for natural slug navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/posts/')) {
        const slug = path.replace('/posts/', '');
        const found = posts.find(p => p.slug === slug);
        if (found) {
          setSelectedPost(found);
        }
      } else {
        setSelectedPost(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [posts]);

  const handleSelectPost = (post: BlogPost) => {
    setSelectedPost(post);
    try {
      window.history.pushState({ postSlug: post.slug }, '', `/posts/${post.slug}`);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToPosts = () => {
    setSelectedPost(null);
    try {
      window.history.pushState(null, '', '/');
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@') || isSubmittingNewsletter) return;

    setIsSubmittingNewsletter(true);
    try {
      const formData = new FormData();
      formData.append(GOOGLE_FORM_EMAIL_ENTRY_ID, newsletterEmail);

      await fetch(GOOGLE_FORM_ACTION_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData,
      });

      setNewsletterSubmitted(true);
    } catch {
      setNewsletterSubmitted(true);
    } finally {
      setIsSubmittingNewsletter(false);
    }
  };

  // Derive unique categories from posts
  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [posts]);

  // Filtered posts based on category and search query
  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = 
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q));

      return matchCat && matchSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#0c1017] dark:text-slate-100 transition-colors duration-150 font-sans selection:bg-[#d92338]/20 selection:text-[#d92338]">
      {/* Blog Navigation Header */}
      <BlogNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenTemplateModal={() => setTemplateModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {selectedPost ? (
          <BlogReader post={selectedPost} onBack={handleBackToPosts} />
        ) : (
          <div className="space-y-10">
            {/* Simple Editorial Hero Header */}
            <div className="max-w-3xl space-y-3 pb-8 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-mono font-bold tracking-widest text-[#d92338] uppercase">
                CYBERAISECURE INSIGHTS
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Architecture, Engineering & Security Insights
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                Technical articles, system designs, and security engineering practices written for practitioners.
              </p>
            </div>

            {/* Category Filter Tabs */}
            {categories.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-mono">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Post Feed or Empty State */}
            {posts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121824] p-8 sm:p-12 shadow-sm text-center max-w-3xl mx-auto">
                <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-[#d92338] dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
                  <FileCode className="w-6 h-6" />
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Direct Markdown Pipeline Ready (`content/posts/*.md`)</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                  No Blog Posts Published Yet
                </h2>

                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed mb-6 font-sans">
                  To publish a blog, simply add a <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">.md</code> file directly into <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">content/posts/</code> and push to GitHub. It will render automatically!
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setTemplateModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#d92338] hover:bg-[#b81d2e] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <FileCode className="w-4 h-4" />
                    <span>View & Copy Blog Template (.md)</span>
                  </button>
                </div>

                {/* 3 Step Direct Markdown Guide */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-left">
                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
                    <span className="text-[10px] font-mono text-[#d92338] font-bold block mb-1">01. COPY TEMPLATE</span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Get blog-template.md</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Click the button above to copy the ready-to-use template with SEO frontmatter.</p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
                    <span className="text-[10px] font-mono text-[#d92338] font-bold block mb-1">02. SAVE FILE</span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">content/posts/your-post.md</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Save your markdown file in <code className="font-mono">content/posts/</code>.</p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
                    <span className="text-[10px] font-mono text-[#d92338] font-bold block mb-1">03. GIT PUSH</span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Instant Deployment</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Run <code className="font-mono">git push origin main</code>. Your blog is live on cyberaisecure.com!</p>
                  </div>
                </div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="p-12 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121824] shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No blog posts found matching &quot;{searchQuery}&quot;
                </h3>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                  className="mt-3 text-xs font-mono text-[#d92338] hover:underline"
                >
                  Reset Search Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.map(post => (
                  <BlogCard key={post.id} post={post} onSelect={handleSelectPost} />
                ))}
              </div>
            )}

            {/* Newsletter Section (Direct to Google Forms) */}
            <div className="rounded-2xl bg-slate-900 text-white dark:bg-[#121824] border border-slate-800 p-8 sm:p-10 shadow-sm mt-12">
              <div className="max-w-2xl mx-auto text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-800 text-xs font-mono text-[#d92338]">
                  <Mail className="w-3.5 h-3.5" />
                  <span>CYBERAISECURE NEWSLETTER</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Stay Ahead with Technical Deep-Dives
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-lg mx-auto">
                  Subscribe to receive our latest engineering blogs, architecture breakdowns, and security insights directly in your inbox.
                </p>

                {newsletterSubmitted ? (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs font-mono flex items-center justify-center gap-2 max-w-md mx-auto">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Subscribed! Thank you for following CyberAiSecure.</span>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="engineer@enterprise.corp"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#d92338] font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingNewsletter}
                      className="bg-[#d92338] hover:bg-[#b81d2e] disabled:opacity-75 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isSubmittingNewsletter ? 'Subscribing...' : 'Subscribe'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Markdown Template Modal */}
      <TemplateModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
      />

      {/* Blog Footer */}
      <BlogFooter
        onOpenTemplateModal={() => setTemplateModalOpen(true)}
      />
    </div>
  );
}
