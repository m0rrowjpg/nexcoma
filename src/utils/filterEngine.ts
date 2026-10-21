import type { AITool, FilterState, ToolCategory } from '../types/index.ts';

/**
 * Normalizes string for case-insensitive search
 */
export function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

/**
 * Checks if a tool matches a search query across name, tagline, description, features, and category.
 */
export function searchQueryMatches(tool: AITool, rawQuery: string): boolean {
  const query = normalizeText(rawQuery);
  if (!query) return true;

  const tokens = query.split(/\s+/).filter(Boolean);

  const searchableCorpus = normalizeText(
    [
      tool.name,
      tool.slug,
      tool.tagline,
      tool.description,
      tool.category,
      tool.bestFor,
      tool.platforms.join(' '),
      tool.keyFeatures.join(' '),
    ].join(' ')
  );

  // Every token in the query must match somewhere in the corpus
  return tokens.every((token) => searchableCorpus.includes(token));
}

/**
 * Filters a collection of tools according to category, pricing, platform, search query, and sorts them.
 */
export function filterTools(tools: AITool[], filters: FilterState): AITool[] {
  let result = tools.filter((tool) => {
    // 1. Search Query
    if (filters.search && !searchQueryMatches(tool, filters.search)) {
      return false;
    }

    // 2. Category
    if (filters.category !== 'All' && tool.category !== filters.category) {
      return false;
    }

    // 3. Pricing Model
    if (filters.pricing !== 'All' && tool.pricingModel !== filters.pricing) {
      return false;
    }

    // 4. Platform
    if (filters.platform !== 'All') {
      const matchPlatform = tool.platforms.some((p) =>
        normalizeText(p).includes(normalizeText(filters.platform))
      );
      if (!matchPlatform) return false;
    }

    return true;
  });

  // Sort
  if (filters.sortBy === 'curated') {
    result.sort((a, b) => a.curatedRank - b.curatedRank);
  } else if (filters.sortBy === 'newest') {
    result.sort((a, b) => b.addedYear - a.addedYear);
  } else if (filters.sortBy === 'alphabetical') {
    result.sort((a, b) => a.name.localeCompare(b.name));
  }

  return result;
}

/**
 * Finds alternative / similar tools in the same or adjacent category, excluding self.
 */
export function getRecommendedAlternatives(
  currentTool: AITool,
  allTools: AITool[],
  limit = 3
): AITool[] {
  return allTools
    .filter((t) => t.id !== currentTool.id && t.category === currentTool.category)
    .sort((a, b) => a.curatedRank - b.curatedRank)
    .slice(0, limit);
}

/**
 * Computes category distribution counts dynamically from tool set.
 */
export function calculateCategoryCounts(tools: AITool[]): Record<string, number> {
  const counts: Record<string, number> = { All: tools.length };
  for (const tool of tools) {
    counts[tool.category] = (counts[tool.category] || 0) + 1;
  }
  return counts;
}

/**
 * Generates comparison matrix for a set of selected tools.
 */
export function generateComparisonMatrix(selectedTools: AITool[]) {
  return [
    {
      id: 'category',
      label: 'Category',
      values: selectedTools.map((t) => t.category),
    },
    {
      id: 'pricingModel',
      label: 'Pricing Model',
      values: selectedTools.map((t) => t.pricingModel),
    },
    {
      id: 'startingPrice',
      label: 'Starting Price',
      values: selectedTools.map((t) => t.startingPrice),
    },
    {
      id: 'primaryInterface',
      label: 'Primary Interface',
      values: selectedTools.map((t) => t.specs.primaryInterface),
    },
    {
      id: 'contextWindow',
      label: 'Context Window / Capacity',
      values: selectedTools.map((t) => t.specs.contextWindow || 'Standard'),
    },
    {
      id: 'apiAvailable',
      label: 'Developer API Available',
      values: selectedTools.map((t) => (t.specs.apiAvailable ? 'Yes' : 'No')),
    },
    {
      id: 'selfHostable',
      label: 'Self-Hostable / Offline',
      values: selectedTools.map((t) => (t.specs.selfHostable ? 'Yes' : 'No')),
    },
    {
      id: 'privacyNoTraining',
      label: 'Zero Data Training Pledge',
      values: selectedTools.map((t) => (t.specs.privacyNoTraining ? 'Yes' : 'Varies by tier')),
    },
    {
      id: 'bestFor',
      label: 'Ideal Workflow Fit',
      values: selectedTools.map((t) => t.bestFor),
    },
  ];
}
