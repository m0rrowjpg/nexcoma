import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { SavedToolsProvider } from './context/SavedToolsContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryBar } from './components/CategoryBar';
import { ToolCard } from './components/ToolCard';
import { ToolDetailModal } from './components/ToolDetailModal';
import { CompareView } from './components/CompareView';
import { GuidesSection } from './components/GuidesSection';
import { GuideReaderModal } from './components/GuideReaderModal';
import { SavedDrawer } from './components/SavedDrawer';
import { SubmitToolModal } from './components/SubmitToolModal';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';

import { TOOLS_DATA, CATEGORIES_DATA } from './data/toolsData';
import { GUIDES_DATA } from './data/guidesData';
import { filterTools, calculateCategoryCounts } from './utils/filterEngine';
import type { AITool, ToolCategory, PricingModel, SortOption, GuideArticle } from './types';
import { getPublishedContent, type PublishedContent } from './lib/content';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import {
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Code,
  Workflow,
  PenTool,
  Search,
  Video,
  Layers,
  Scale,
} from 'lucide-react';

export default function App() {
  const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID;
  const [analyticsConsent, setAnalyticsConsent] = useState<'accepted' | 'rejected' | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = window.localStorage.getItem('nexcoma_analytics_consent');
    return saved === 'accepted' || saved === 'rejected' ? saved : null;
  });
  const lastTrackedRoute = useRef<string | null>(null);
  const [siteContent, setSiteContent] = useState<PublishedContent>({
    tools: TOOLS_DATA,
    categories: CATEGORIES_DATA,
    guides: GUIDES_DATA,
    seo: {},
  });
  const [contentError, setContentError] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    const refreshContent = () => getPublishedContent()
      .then((content) => {
        if (active) {
          setSiteContent(content);
          setContentError('');
        }
      })
      .catch((error: unknown) => {
        if (active) setContentError(error instanceof Error ? error.message : 'Could not load live website content.');
      });
    void refreshContent();
    const channel = supabase?.channel('published-website-content')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_items' }, () => { void refreshContent(); })
      .subscribe();
    const refreshTimer = window.setInterval(() => { void refreshContent(); }, 60_000);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
      if (channel && supabase) void supabase.removeChannel(channel);
    };
  }, []);

  const tools = siteContent.tools;
  const categories = siteContent.categories;
  const guides = siteContent.guides;

  useEffect(() => {
    if (!measurementId || analyticsConsent !== 'accepted') return;
    const scriptId = 'nexcoma-ga4-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);
    }
    window.dataLayer = window.dataLayer || [];
    window.gtag = (...arguments_) => window.dataLayer.push(arguments_);
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { send_page_view: false, anonymize_ip: true });
  }, [analyticsConsent, measurementId]);

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'discover' | 'categories' | 'compare' | 'guides' | 'about'
  >('discover');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'All'>('All');
  const [selectedPricing, setSelectedPricing] = useState<PricingModel | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('curated');

  // Modals & Drawers
  const [activeTool, setActiveTool] = useState<AITool | null>(null);
  const [activeGuide, setActiveGuide] = useState<GuideArticle | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);

  // Compared tools state
  const [comparedTools, setComparedTools] = useState<AITool[]>(() => [
    TOOLS_DATA[0], // Cursor
    TOOLS_DATA[9], // GitHub Copilot
  ]);

  useEffect(() => {
    setComparedTools((current) => current.flatMap((tool) => {
      const updated = tools.find((candidate) => candidate.id === tool.id || candidate.slug === tool.slug);
      return updated ? [updated] : [];
    }));
  }, [tools]);

  useEffect(() => {
    if (activeTool) {
      const latestTool = tools.find((tool) => tool.id === activeTool.id || tool.slug === activeTool.slug);
      if (latestTool) setActiveTool(latestTool);
      else {
        setActiveTool(null);
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
    if (activeGuide) {
      const latestGuide = guides.find((guide) => guide.id === activeGuide.id || guide.slug === activeGuide.slug);
      if (latestGuide) setActiveGuide(latestGuide);
      else {
        setActiveGuide(null);
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [tools, guides, activeTool, activeGuide]);

  useEffect(() => {
    const currentSlug = activeTool?.slug ?? activeGuide?.slug;
    const seo = currentSlug ? siteContent.seo[currentSlug] : undefined;
    document.title = seo?.title || (activeTool?.name ?? activeGuide?.title ?? 'Nexcoma – Discover Smarter Ways to Work | AI Tools & Utilities');
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = seo?.description || 'Curated directory of high-utility AI tools, workflow automation platforms, and productivity software. Compare features, pricing, and modern workflows.';
  }, [activeTool, activeGuide, siteContent.seo]);

  useEffect(() => {
    const route = `${activeTab}|${activeTool?.slug ?? ''}|${activeGuide?.slug ?? ''}`;
    if (!measurementId || analyticsConsent !== 'accepted' || !window.gtag) return;
    if (lastTrackedRoute.current === route) return;
    if (lastTrackedRoute.current === null
      && ((window.location.hash.startsWith('#tool=') && !activeTool)
        || (window.location.hash.startsWith('#guide=') && !activeGuide))) return;
    lastTrackedRoute.current = route;
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
    });
  }, [activeTab, activeTool, activeGuide, measurementId, analyticsConsent]);

  // Handle URL hashes on mount or hashchange (deep-linking for SEO & sharing)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#tool=')) {
        const slug = hash.replace('#tool=', '');
        const found = tools.find((t) => t.slug === slug || t.id === slug);
        if (found) setActiveTool(found);
      } else if (hash.startsWith('#guide=')) {
        const slug = hash.replace('#guide=', '');
        const found = guides.find((g) => g.slug === slug || g.id === slug);
        if (found) setActiveGuide(found);
      } else if (hash === '#compare') {
        setActiveTab('compare');
      } else if (hash === '#categories') {
        setActiveTab('categories');
      } else if (hash === '#about') {
        setActiveTab('about');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [tools, guides]);

  // Update hash when opening or closing tool
  const handleOpenTool = (tool: AITool) => {
    setActiveTool(tool);
    window.history.replaceState(null, '', `#tool=${tool.slug}`);
  };

  const handleCloseTool = () => {
    setActiveTool(null);
    if (window.location.hash.startsWith('#tool=')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  // Update hash when opening or closing guide
  const handleOpenGuide = (guide: GuideArticle) => {
    setActiveGuide(guide);
    window.history.replaceState(null, '', `#guide=${guide.slug}`);
  };

  const handleCloseGuide = () => {
    setActiveGuide(null);
    if (window.location.hash.startsWith('#guide=')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const [compareBarDismissed, setCompareBarDismissed] = useState(false);

  // Compare toggles
  const handleToggleCompare = (tool: AITool) => {
    setCompareBarDismissed(false);
    setComparedTools((prev) => {
      if (prev.some((t) => t.id === tool.id)) {
        return prev.filter((t) => t.id !== tool.id);
      } else {
        if (prev.length >= 3) {
          // Replace the last one
          return [prev[0], prev[1], tool];
        }
        return [...prev, tool];
      }
    });
  };

  const handleRemoveCompare = (toolId: string) => {
    setComparedTools((prev) => prev.filter((t) => t.id !== toolId));
  };

  const handleAddCompare = (tool: AITool) => {
    if (!comparedTools.some((t) => t.id === tool.id) && comparedTools.length < 3) {
      setComparedTools((prev) => [...prev, tool]);
    }
  };

  // Filtered tools computation
  const filteredTools = useMemo(() => {
    return filterTools(tools, {
      search: searchQuery,
      category: selectedCategory,
      pricing: selectedPricing,
      platform: 'All',
      sortBy,
    });
  }, [tools, searchQuery, selectedCategory, selectedPricing, sortBy]);

  // Category counts
  const categoryCounts = useMemo(() => {
    return calculateCategoryCounts(tools);
  }, [tools]);

  // Curated featured tools
  const featuredTools = useMemo(() => {
    return tools.filter((t) => t.featured).slice(0, 4);
  }, [tools]);

  const handleCategorySelect = (cat: ToolCategory | 'All') => {
    setSelectedCategory(cat);
    setActiveTab('discover');
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  return (
    <ThemeProvider>
      <SavedToolsProvider>
        <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 transition-colors duration-200 dark:bg-[#0A0A0C] dark:text-neutral-100">
          {/* Top Bar Navigation */}
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
            onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
          />
          {contentError && (
            <div role="alert" className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
              Live content could not be loaded. Showing the bundled catalog instead. {contentError}
            </div>
          )}
          {measurementId && analyticsConsent === null && (
            <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-700 dark:bg-[#17171c] sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">Nexcoma uses Google Analytics to understand site usage. Analytics scripts stay disabled unless you choose to allow them.</p>
              <div className="flex shrink-0 gap-2"><button onClick={() => { window.localStorage.setItem('nexcoma_analytics_consent', 'rejected'); setAnalyticsConsent('rejected'); }} className="rounded-lg px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800">Decline</button><button onClick={() => { window.localStorage.setItem('nexcoma_analytics_consent', 'accepted'); setAnalyticsConsent('accepted'); }} className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-500">Allow analytics</button></div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1">
            {activeTab === 'discover' && (
              <>
                {/* Hero Section with Search */}
                <Hero
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  resultCount={filteredTools.length}
                  totalCount={tools.length}
                  onSelectSuggestion={(term) => setSearchQuery(term)}
                />

                {/* Workspace Visual Highlight (Hero Complement) */}
                <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
                  <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-900 shadow-xl dark:border-neutral-800">
                    <img
                      src="/src/assets/images/hero_nexcoma_workspace_1792460178035.jpg"
                      alt="Modern minimalist workspace showcasing AI utilities"
                      referrerPolicy="no-referrer"
                      className="h-48 sm:h-72 w-full object-cover opacity-90 transition-opacity hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent flex items-end p-6 sm:p-8">
                      <div className="max-w-xl">
                        <span className="text-[11px] font-semibold tracking-wider text-purple-400 uppercase">
                          The 2026 Developer & Automation Stack
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                          Engineered for clarity, speed, and privacy.
                        </h2>
                        <p className="mt-1 text-xs sm:text-sm text-neutral-300">
                          Explore tested tools that integrate directly into your IDE, terminal, and browser.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Featured Tools Spotlight (Shown if not filtering) */}
                {!searchQuery && selectedCategory === 'All' && selectedPricing === 'All' && (
                  <section className="mx-auto max-w-7xl px-4 pt-14 pb-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                          Featured Editors & Foundation Engines
                        </h2>
                      </div>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        Ranked by utility & ecosystem adoption
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      {featuredTools.map((tool) => (
                        <ToolCard
                          key={tool.id}
                          tool={tool}
                          onOpenDetail={handleOpenTool}
                          onToggleCompare={handleToggleCompare}
                          isCompared={comparedTools.some((c) => c.id === tool.id)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Filter and Category Controls */}
                <div className="mt-8">
                  <CategoryBar
                    categories={categories}
                    activeCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    activePricing={selectedPricing}
                    onSelectPricing={setSelectedPricing}
                    sortBy={sortBy}
                    onSelectSort={setSortBy}
                    categoryCounts={categoryCounts}
                  />
                </div>

                {/* Main Directory Grid */}
                <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between mb-6 text-xs text-neutral-500 dark:text-neutral-400">
                    <div>
                      Found <strong className="font-semibold text-neutral-900 dark:text-white">{filteredTools.length}</strong> software tools
                      {selectedCategory !== 'All' && <span> in {selectedCategory}</span>}
                    </div>

                    {(selectedCategory !== 'All' || selectedPricing !== 'All' || searchQuery) && (
                      <button
                        onClick={() => {
                          setSelectedCategory('All');
                          setSelectedPricing('All');
                          setSearchQuery('');
                        }}
                        className="text-purple-600 hover:underline dark:text-purple-400"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>

                  {filteredTools.length === 0 ? (
                    <div className="my-16 rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-800">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 mb-3">
                        <SlidersHorizontal className="h-6 w-6" />
                      </div>
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                        No matching tools found
                      </h3>
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                        Try relaxing your search query or switching categories.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedCategory('All');
                          setSelectedPricing('All');
                          setSearchQuery('');
                        }}
                        className="mt-4 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500"
                      >
                        Reset all filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredTools.map((tool) => (
                        <ToolCard
                          key={tool.id}
                          tool={tool}
                          onOpenDetail={handleOpenTool}
                          onToggleCompare={handleToggleCompare}
                          isCompared={comparedTools.some((c) => c.id === tool.id)}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* Comparison Callout Floating Pill Bar */}
                {comparedTools.length > 0 && !compareBarDismissed && (
                  <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 flex items-center gap-3 rounded-full border border-neutral-200/90 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md dark:border-neutral-800 dark:bg-[#121216]/95">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-200">
                      <Scale className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="hidden sm:inline">{comparedTools.length} tools to compare:</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400 truncate max-w-[120px] sm:max-w-xs">
                        {comparedTools.map((t) => t.name).join(' vs ')}
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveTab('compare')}
                      className="rounded-full bg-purple-600 px-3.5 py-1 text-xs font-semibold text-white hover:bg-purple-500 transition-colors whitespace-nowrap"
                    >
                      Compare Now
                    </button>

                    <button
                      onClick={() => setCompareBarDismissed(true)}
                      className="flex h-5 w-5 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:text-neutral-500"
                      title="Dismiss comparison bar"
                      aria-label="Dismiss comparison notification"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Educational Guides Section */}
                <GuidesSection
                  guides={guides}
                  onOpenGuide={handleOpenGuide}
                />
              </>
            )}

            {activeTab === 'categories' && (
              <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-10 text-center max-w-2xl mx-auto">
                  <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
                    Explore by Category
                  </h1>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                    Find specialized AI utilities, developer IDEs, automation engines, and creative workflows.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className="group flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs transition-all hover:border-purple-300 hover:shadow-md dark:border-neutral-800 dark:bg-[#111115] dark:hover:border-purple-800 cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-mono text-xs font-semibold text-purple-600 dark:text-purple-400">
                            {categoryCounts[cat.id] || 0} tools listed
                          </span>
                          <span className="text-neutral-400 group-hover:translate-x-1 transition-transform">
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {cat.name}
                        </h3>
                        <p className="mt-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                          {cat.tagline}
                        </p>
                        <p className="mt-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                          {cat.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
                        <span>Browse {cat.id} Tools</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'compare' && (
              <CompareView
                comparedTools={comparedTools}
                onRemoveTool={handleRemoveCompare}
                onAddTool={handleAddCompare}
                allTools={tools}
                onOpenDetail={handleOpenTool}
              />
            )}

            {activeTab === 'guides' && (
              <div className="py-6">
                <GuidesSection
                  guides={guides}
                  onOpenGuide={(g) => setActiveGuide(g)}
                />
              </div>
            )}

            {activeTab === 'about' && (
              <div id="methodology">
                <AboutSection />
              </div>
            )}
          </main>

          {/* Footer */}
          <Footer
            categories={categories}
            onSelectCategory={(cat) => handleCategorySelect(cat)}
            onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
          />

          {/* Modals & Drawers */}
          <ToolDetailModal
            tool={activeTool}
            onClose={handleCloseTool}
            allTools={tools}
            onSelectTool={handleOpenTool}
            onToggleCompare={handleToggleCompare}
            isCompared={activeTool ? comparedTools.some((c) => c.id === activeTool.id) : false}
          />

          <GuideReaderModal
            guide={activeGuide}
            onClose={handleCloseGuide}
          />

          <SavedDrawer
            isOpen={isSavedDrawerOpen}
            onClose={() => setIsSavedDrawerOpen(false)}
            onSelectTool={handleOpenTool}
          />

          <SubmitToolModal
            isOpen={isSubmitModalOpen}
            categories={categories}
            onClose={() => setIsSubmitModalOpen(false)}
          />
        </div>
      </SavedToolsProvider>
    </ThemeProvider>
  );
}
