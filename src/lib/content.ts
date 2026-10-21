import { CATEGORIES_DATA, TOOLS_DATA } from '../data/toolsData';
import { GUIDES_DATA } from '../data/guidesData';
import type { AITool, CategoryMeta, GuideArticle } from '../types';
import { isSupabaseConfigured, supabase } from './supabase';

export interface PublishedContent {
  tools: AITool[];
  categories: CategoryMeta[];
  guides: GuideArticle[];
  seo: Record<string, { title: string; description: string }>;
}

export async function getPublishedContent(): Promise<PublishedContent> {
  if (!isSupabaseConfigured || !supabase) {
    return { tools: TOOLS_DATA, categories: CATEGORIES_DATA, guides: GUIDES_DATA, seo: {} };
  }

  const { data, error } = await supabase
    .from('content_items')
    .select('content_type, slug, title, data, seo_title, seo_description')
    .eq('status', 'published')
    .in('content_type', ['tool', 'category', 'article', 'affiliate'])
    .order('title');

  if (error) throw new Error(`Could not load published content: ${error.message}`);

  const records = data ?? [];
  const seo = Object.fromEntries(
    records
      .filter((item) => item.content_type === 'tool' || item.content_type === 'article')
      .map((item) => [item.slug, {
        title: item.seo_title || item.title,
        description: item.seo_description || '',
      }]),
  );
  const tools = records
    .filter((item) => item.content_type === 'tool')
    .map((item) => item.data as unknown as AITool);
  const categories = records
    .filter((item) => item.content_type === 'category')
    .map((item) => item.data as unknown as CategoryMeta);
  const guides = records
    .filter((item) => item.content_type === 'article')
    .map((item) => item.data as unknown as GuideArticle);
  const affiliates = records
    .filter((item) => item.content_type === 'affiliate')
    .map((item) => item.data as { toolSlug?: string; url?: string })
    .filter((item) => item.toolSlug && item.url);

  const affiliateUrls = new Map(affiliates.map((item) => [item.toolSlug!, item.url!]));

  return {
    tools: tools.map((tool) => ({
      ...tool,
      officialUrl: affiliateUrls.get(tool.slug) ?? tool.officialUrl,
    })),
    categories,
    guides,
    seo,
  };
}
