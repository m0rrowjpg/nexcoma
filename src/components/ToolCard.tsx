import React from 'react';
import { Bookmark, BookmarkCheck, ArrowUpRight, Scale, Check } from 'lucide-react';
import { AITool } from '../types';
import { useSavedTools } from '../context/SavedToolsContext';

interface ToolCardProps {
  tool: AITool;
  onOpenDetail: (tool: AITool) => void;
  onToggleCompare: (tool: AITool) => void;
  isCompared: boolean;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  onOpenDetail,
  onToggleCompare,
  isCompared,
}) => {
  const { isSaved, toggleSave } = useSavedTools();
  const saved = isSaved(tool.id);

  return (
    <article
      onClick={() => onOpenDetail(tool)}
      className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-2xs transition-all hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-[#111115] dark:hover:border-neutral-700 cursor-pointer"
    >
      <div>
        {/* Top unboxed metadata line */}
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-3">
          <div className="flex items-center gap-1.5 font-medium">
            <span>{tool.category}</span>
            <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
            <span>{tool.pricingModel}</span>
          </div>

          {/* Actions: Compare & Bookmark */}
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onToggleCompare(tool)}
              title={isCompared ? 'Remove from comparison' : 'Add to compare'}
              className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${
                isCompared
                  ? 'border-purple-600 bg-purple-50 text-purple-700 dark:border-purple-500 dark:bg-purple-950/40 dark:text-purple-300'
                  : 'border-neutral-200/90 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:border-neutral-800 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
              }`}
              aria-label={`Compare ${tool.name}`}
            >
              <Scale className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => toggleSave(tool.id)}
              title={saved ? 'Remove from saved' : 'Save tool to workbench'}
              className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${
                saved
                  ? 'border-purple-600 bg-purple-50 text-purple-700 dark:border-purple-500 dark:bg-purple-950/40 dark:text-purple-300'
                  : 'border-neutral-200/90 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:border-neutral-800 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
              }`}
              aria-label={`Save ${tool.name}`}
            >
              {saved ? (
                <BookmarkCheck className="h-3.5 w-3.5 fill-purple-600 dark:fill-purple-400" />
              ) : (
                <Bookmark className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Brand & Name Lockup */}
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold text-white shadow-xs"
            style={{ backgroundColor: tool.iconBg }}
          >
            {tool.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900 group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400 transition-colors">
              {tool.name}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
              {tool.tagline}
            </p>
          </div>
        </div>

        {/* Key Features preview */}
        <div className="mt-4 space-y-1.5 border-t border-neutral-100 pt-3 dark:border-neutral-800/60">
          {tool.keyFeatures.slice(0, 2).map((feat, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400"
            >
              <Check className="h-3 w-3 shrink-0 text-purple-600 dark:text-purple-400" />
              <span className="truncate">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs dark:border-neutral-800/60">
        <div>
          <span className="text-neutral-400 dark:text-neutral-500 block text-[10px]">
            Pricing
          </span>
          <span className="font-medium text-neutral-900 dark:text-neutral-200">
            {tool.startingPrice}
          </span>
        </div>

        <div className="flex items-center gap-1 font-medium text-purple-600 group-hover:translate-x-0.5 transition-transform dark:text-purple-400">
          <span>Explore</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </article>
  );
};
