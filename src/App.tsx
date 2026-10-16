/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { BlogNavbar } from './components/BlogNavbar';
import { BlogCard } from './components/BlogCard';
import { BlogReader } from './components/BlogReader';
import { BlogFooter } from './components/BlogFooter';
import { loadAllMarkdownPosts } from './utils/markdownLoader';
import { BlogPost } from './types';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';

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

  // Helper to extract post slug from pathname, query string, or hash
  const getPostFromLocation = (allPosts: BlogPost[]): BlogPost | null => {
    try {
      const pathname = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;

      let targetSlug = '';

      if (pathname.includes('/posts/')) {
        targetSlug = pathname.split('/posts/')[1]?.split(/[?#/]/)[0] || '';
      } else if (search.includes('/posts/')) {
        targetSlug = search.split('/posts/')[1]?.split(/[?&#/]/)[0] || '';
      } else if (hash.includes('/posts/')) {
        targetSlug = hash.split('/posts/')[1]?.split(/[?&#/]/)[0] || '';
      }

      if (targetSlug) {
        const decoded = decodeURIComponent(targetSlug).trim();
        return allPosts.find(p => p.slug === decoded || p.id === decoded) || null;
      }
    } catch {}
    return null;
  };

  // Load all markdown files directly from content/posts/*.md and resolve deep link
  useEffect(() => {
    const mdPosts = loadAllMarkdownPosts();
    setPosts(mdPosts);

    // Immediately resolve direct link on initial page visit/refresh
    const initialPost = getPostFromLocation(mdPosts);
    if (initialPost) {
      setSelectedPost(initialPost);
    }
  }, []);

  // Sync with browser URL / history for natural slug navigation
  useEffect(() => {
    const handlePopState = () => {
      const matched = getPostFromLocation(posts);
      setSelectedPost(matched);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [posts]);

  // Update document title dynamically based on active post
  useEffect(() => {
    if (selectedPost) {
      document.title = `${selectedPost.title} | CyberAiSecure`;
    } else {
      document.title = 'CyberAiSecure | Architecture, Engineering & Security Insights';
    }
  }, [selectedPost]);

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

  const handleGoHome = () => {
    setSelectedPost(null);
    setSearchQuery('');
    setSelectedCategory('All');
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

  // Derive unique categories dynamically from uploaded markdown posts
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
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        posts={posts}
        onSelectPost={handleSelectPost}
        onGoHome={handleGoHome}
        isHome={selectedPost === null && selectedCategory === 'All' && !searchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {selectedPost ? (
          <BlogReader post={selectedPost} onBack={handleBackToPosts} />
        ) : (
          <div className="space-y-10">
            {/* Simple Editorial Header */}
            <div className="max-w-3xl space-y-3 pb-8 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-mono font-bold tracking-widest text-[#d92338] uppercase">
                CYBERAISECURE
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

            {/* Post Feed or Clean Empty State */}
            {posts.length === 0 ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121824] p-8 sm:p-12 shadow-sm text-center max-w-2xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                  No Blog Posts Published Yet
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  Upload your <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">.md</code> files directly into the <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">content/posts/</code> folder in GitHub. When you push, they will automatically appear here and in the navigation bar!
                </p>
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

      {/* Blog Footer */}
      <BlogFooter />
    </div>
  );
}
