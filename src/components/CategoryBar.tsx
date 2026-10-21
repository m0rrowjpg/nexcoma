import React from 'react';
import {
  Code,
  Sparkles,
  Workflow,
  PenTool,
  Search,
  Video,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import { CategoryMeta, ToolCategory, PricingModel, SortOption } from '../types';

interface CategoryBarProps {
  categories: CategoryMeta[];
  activeCategory: ToolCategory | 'All';
  onSelectCategory: (cat: ToolCategory | 'All') => void;
  activePricing: PricingModel | 'All';
  onSelectPricing: (price: PricingModel | 'All') => void;
  sortBy: SortOption;
  onSelectSort: (sort: SortOption) => void;
  categoryCounts: Record<string, number>;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  activeCategory,
  categories: categoryData,
  onSelectCategory,
  activePricing,
  onSelectPricing,
  sortBy,
  onSelectSort,
  categoryCounts,
}) => {
  const categoryIcons: Record<string, React.FC<{ className?: string }>> = {
    Coding: Code,
    Productivity: Sparkles,
    Automation: Workflow,
    Writing: PenTool,
    Research: Search,
    Design: Sparkles,
    Video: Video,
  };
  const categories: { id: ToolCategory | 'All'; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'All', label: 'All Tools', icon: Layers },
    ...categoryData.map((category) => ({
      id: category.id,
      label: category.name,
      icon: categoryIcons[category.id] ?? Sparkles,
    })),
  ];

  const pricingModels: (PricingModel | 'All')[] = [
    'All',
    'Free',
    'Freemium',
    'Paid',
    'Open Source',
  ];

  return (
    <div className="w-full border-b border-neutral-200/80 bg-white/70 py-4 backdrop-blur-xs dark:border-neutral-800 dark:bg-[#0A0A0C]/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-8">
        {/* Category Segmented Scroll */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-[#141418] shrink-0">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const count = categoryCounts[cat.id] ?? 0;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white'
                      : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-neutral-400'}`} />
                  <span>{cat.label}</span>
                  <span className={`font-mono text-[10px] ${isActive ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-400 dark:text-neutral-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing Filter and Sort Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Pricing Model Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="font-medium text-neutral-400 dark:text-neutral-500 whitespace-nowrap mr-1">
              Pricing:
            </span>
            {pricingModels.map((model) => (
              <button
                key={model}
                onClick={() => onSelectPricing(model)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  activePricing === model
                    ? 'bg-neutral-900 text-white dark:bg-purple-600 dark:text-white'
                    : 'border border-neutral-200/80 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-[#121216] dark:text-neutral-400 dark:hover:bg-neutral-800/60'
                }`}
              >
                {model}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-neutral-400 dark:text-neutral-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => onSelectSort(e.target.value as SortOption)}
              className="rounded-lg border border-neutral-200/90 bg-white px-2.5 py-1 text-xs font-medium text-neutral-800 shadow-2xs focus:border-purple-600 focus:outline-none dark:border-neutral-800 dark:bg-[#121216] dark:text-neutral-200"
            >
              <option value="curated">Curated Rank</option>
              <option value="newest">Recently Added</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
