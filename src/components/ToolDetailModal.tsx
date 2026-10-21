import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Check,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Scale,
  Share2,
  Copy,
  ChevronRight,
  Shield,
  Layers,
  Code2,
  Terminal,
} from 'lucide-react';
import type { AITool } from '../types';
import { useSavedTools } from '../context/SavedToolsContext';
import { getRecommendedAlternatives } from '../utils/filterEngine';

interface ToolDetailModalProps {
  tool: AITool | null;
  onClose: () => void;
  allTools: AITool[];
  onSelectTool: (tool: AITool) => void;
  onToggleCompare: (tool: AITool) => void;
  isCompared: boolean;
}

export const ToolDetailModal: React.FC<ToolDetailModalProps> = ({
  tool,
  onClose,
  allTools,
  onSelectTool,
  onToggleCompare,
  isCompared,
}) => {
  const { isSaved, toggleSave } = useSavedTools();
  const [copied, setCopied] = useState(false);

  if (!tool) return null;

  const saved = isSaved(tool.id);
  const alternatives = getRecommendedAlternatives(tool, allTools, 3);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/#tool=${tool.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-[#121216] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-200/80 px-6 py-4 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span>{tool.category}</span>
            <span aria-hidden="true">·</span>
            <span>Added {tool.addedYear}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-purple-600 dark:text-purple-400">Rank #{tool.curatedRank}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
              title="Copy deep link"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
            <button
              onClick={() => onToggleCompare(tool)}
              className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors ${
                isCompared
                  ? 'border-purple-600 bg-purple-50 text-purple-700 dark:border-purple-500 dark:bg-purple-950/40 dark:text-purple-300'
                  : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800'
              }`}
            >
              <Scale className="h-3.5 w-3.5" />
              <span>{isCompared ? 'Comparing' : 'Compare'}</span>
            </button>
            <button
              onClick={() => toggleSave(tool.id)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                saved
                  ? 'border-purple-600 bg-purple-50 text-purple-700 dark:border-purple-500 dark:bg-purple-950/40 dark:text-purple-300'
                  : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800'
              }`}
              title={saved ? 'Remove from saved' : 'Save tool'}
            >
              {saved ? (
                <BookmarkCheck className="h-4 w-4 fill-purple-600 dark:fill-purple-400" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {/* Main Info Hero */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-mono text-lg font-bold text-white shadow-sm"
                style={{ backgroundColor: tool.iconBg }}
              >
                {tool.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  {tool.name}
                </h2>
                <p className="mt-1 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {tool.tagline}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {tool.pricingModel}
                  </span>
                  <span>·</span>
                  <span>Starts at {tool.startingPrice}</span>
                  <span>·</span>
                  <span>Platforms: {tool.platforms.join(', ')}</span>
                </div>
              </div>
            </div>

            <a
              href={tool.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-purple-500 whitespace-nowrap shrink-0"
            >
              <span>Visit Official Website</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 text-sm leading-relaxed text-neutral-700 dark:border-neutral-800/60 dark:bg-[#17171C] dark:text-neutral-300">
            {tool.description}
          </div>

          {/* Workflow fit callout */}
          <div className="flex items-start gap-3 rounded-xl border border-purple-200/60 bg-purple-50/40 p-4 text-xs text-purple-900 dark:border-purple-900/40 dark:bg-purple-950/20 dark:text-purple-200">
            <Shield className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">Recommended Workflow Fit:</strong>
              <span>{tool.bestFor}</span>
            </div>
          </div>

          {/* Two-column: Key Features & Pros/Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Features */}
            <div className="rounded-xl border border-neutral-200/80 p-5 dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                Key Verified Features
              </h3>
              <ul className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-300">
                {tool.keyFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span className="leading-normal">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pros & Cons */}
            <div className="rounded-xl border border-neutral-200/80 p-5 dark:border-neutral-800 space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-2">
                  Strengths
                </h3>
                <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                  {tool.pros.map((pro, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-neutral-100 pt-3 dark:border-neutral-800">
                <h3 className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-2">
                  Trade-offs & Limitations
                </h3>
                <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                  {tool.cons.map((con, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">!</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Specifications Matrix */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
              Technical Specifications
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-neutral-200/80 p-3 dark:border-neutral-800">
                <span className="text-neutral-400 dark:text-neutral-500 block text-[11px] mb-1">
                  Context Window
                </span>
                <span className="font-medium text-neutral-900 dark:text-neutral-200">
                  {tool.specs.contextWindow || 'N/A'}
                </span>
              </div>
              <div className="rounded-xl border border-neutral-200/80 p-3 dark:border-neutral-800">
                <span className="text-neutral-400 dark:text-neutral-500 block text-[11px] mb-1">
                  Developer API
                </span>
                <span className="font-medium text-neutral-900 dark:text-neutral-200">
                  {tool.specs.apiAvailable ? 'Available' : 'No Public API'}
                </span>
              </div>
              <div className="rounded-xl border border-neutral-200/80 p-3 dark:border-neutral-800">
                <span className="text-neutral-400 dark:text-neutral-500 block text-[11px] mb-1">
                  Self-Hostable / Offline
                </span>
                <span className="font-medium text-neutral-900 dark:text-neutral-200">
                  {tool.specs.selfHostable ? 'Yes (Docker/Binary)' : 'Cloud Managed'}
                </span>
              </div>
              <div className="rounded-xl border border-neutral-200/80 p-3 dark:border-neutral-800">
                <span className="text-neutral-400 dark:text-neutral-500 block text-[11px] mb-1">
                  Data Training Policy
                </span>
                <span className="font-medium text-neutral-900 dark:text-neutral-200">
                  {tool.specs.privacyNoTraining ? 'Zero-Training Default' : 'Opt-in required'}
                </span>
              </div>
              <div className="rounded-xl border border-neutral-200/80 p-3 dark:border-neutral-800">
                <span className="text-neutral-400 dark:text-neutral-500 block text-[11px] mb-1">
                  Primary Interface
                </span>
                <span className="font-medium text-neutral-900 dark:text-neutral-200">
                  {tool.specs.primaryInterface}
                </span>
              </div>
              <div className="rounded-xl border border-neutral-200/80 p-3 dark:border-neutral-800">
                <span className="text-neutral-400 dark:text-neutral-500 block text-[11px] mb-1">
                  Language / Runtime
                </span>
                <span className="font-medium text-neutral-900 dark:text-neutral-200 truncate block">
                  {tool.specs.primaryLanguageSupport}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Tiers Table */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
              Pricing Tiers Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {tool.pricingTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col justify-between rounded-xl border p-4 text-xs ${
                    tier.isPopular
                      ? 'border-purple-600 bg-purple-50/30 dark:border-purple-500 dark:bg-purple-950/20'
                      : 'border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-[#141418]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        {tier.name}
                      </span>
                      {tier.isPopular && (
                        <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-bold text-neutral-900 dark:text-white my-2">
                      {tier.price}
                    </div>
                    <ul className="space-y-1.5 text-neutral-600 dark:text-neutral-400">
                      {tier.features.map((f, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Alternatives */}
          {alternatives.length > 0 && (
            <div className="border-t border-neutral-100 pt-6 dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                Similar Tools in {tool.category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {alternatives.map((alt) => (
                  <button
                    key={alt.id}
                    onClick={() => onSelectTool(alt)}
                    className="flex items-center gap-3 rounded-xl border border-neutral-200/80 p-3 text-left transition-colors hover:border-purple-300 dark:border-neutral-800 dark:hover:border-purple-700"
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold text-white"
                      style={{ backgroundColor: alt.iconBg }}
                    >
                      {alt.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-neutral-900 dark:text-white">
                        {alt.name}
                      </div>
                      <div className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                        {alt.pricingModel} · {alt.startingPrice}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
