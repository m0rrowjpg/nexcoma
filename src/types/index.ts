export type PricingModel = 'Free' | 'Freemium' | 'Paid' | 'Open Source';

export type ToolCategory =
  | (string & {})
  | 'Writing'
  | 'Coding'
  | 'Design'
  | 'Productivity'
  | 'Automation'
  | 'Research'
  | 'Video';

export interface PricingTier {
  name: string;
  price: string;
  cadence?: string;
  features: string[];
  isPopular?: boolean;
}

export interface ComparisonSpecs {
  contextWindow?: string;
  apiAvailable: boolean;
  selfHostable: boolean;
  privacyNoTraining: boolean;
  primaryInterface: string;
  primaryLanguageSupport: string;
}

export interface AITool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  pricingModel: PricingModel;
  startingPrice: string;
  officialUrl: string;
  featured: boolean;
  curatedRank: number;
  addedYear: number;
  keyFeatures: string[];
  pros: string[];
  cons: string[];
  bestFor: string;
  platforms: string[];
  pricingTiers: PricingTier[];
  specs: ComparisonSpecs;
  iconBg: string;
}

export interface CategoryMeta {
  id: ToolCategory;
  name: string;
  tagline: string;
  description: string;
  count: number;
}

export interface GuideArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: ToolCategory;
  readTime: string;
  date: string;
  author: {
    name: string;
    role: string;
  };
  coverImage?: string;
  excerpt: string;
  keyTakeaways: string[];
  contentSections: {
    heading: string;
    body: string[];
    highlightQuote?: string;
  }[];
}

export type SortOption = 'curated' | 'newest' | 'alphabetical';

export interface FilterState {
  search: string;
  category: ToolCategory | 'All';
  pricing: PricingModel | 'All';
  platform: string | 'All';
  sortBy: SortOption;
}
