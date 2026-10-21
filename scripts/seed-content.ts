import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { CATEGORIES_DATA, TOOLS_DATA } from '../src/data/toolsData';
import { GUIDES_DATA } from '../src/data/guidesData';

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding.');
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const entries = [
  ...TOOLS_DATA.map((data) => ({
    content_type: 'tool',
    slug: data.slug,
    title: data.name,
    data,
    seo_title: `${data.name} review, pricing & features | Nexcoma`,
    seo_description: data.tagline,
  })),
  ...CATEGORIES_DATA.map((data) => ({
    content_type: 'category',
    slug: data.id.toLowerCase(),
    title: data.name,
    data,
    seo_title: `${data.name} | Nexcoma`,
    seo_description: data.description,
  })),
  ...GUIDES_DATA.map((data) => ({
    content_type: 'article',
    slug: data.slug,
    title: data.title,
    data,
    seo_title: data.title,
    seo_description: data.excerpt,
  })),
];

for (const entry of entries) {
  const { data: existing, error: lookupError } = await supabase
    .from('content_items')
    .select('id')
    .eq('slug', entry.slug)
    .maybeSingle();

  if (lookupError) throw new Error(`Could not inspect "${entry.slug}": ${lookupError.message}`);
  if (existing) continue;

  const { error } = await supabase
    .from('content_items')
    .insert({ ...entry, status: 'published' });
  if (error) throw new Error(`Could not seed "${entry.slug}": ${error.message}`);
}

console.log(`Published ${entries.length} initial catalog records where missing.`);
