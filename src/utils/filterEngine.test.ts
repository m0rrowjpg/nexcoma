import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeText,
  searchQueryMatches,
  filterTools,
  getRecommendedAlternatives,
  calculateCategoryCounts,
  generateComparisonMatrix,
} from './filterEngine.ts';
import type { AITool } from '../types/index.ts';

const mockTools: AITool[] = [
  {
    id: 'tool-cursor',
    name: 'Cursor',
    slug: 'cursor',
    tagline: 'AI code editor',
    description: 'A developer IDE designed for rapid pair programming with Composer.',
    category: 'Coding',
    pricingModel: 'Freemium',
    startingPrice: '$20/month',
    officialUrl: 'https://cursor.com',
    featured: true,
    curatedRank: 1,
    addedYear: 2024,
    keyFeatures: ['Composer', 'Multi-file edits'],
    pros: ['Fast', 'Context aware'],
    cons: ['Rate limits'],
    bestFor: 'Software developers',
    platforms: ['Mac', 'Windows', 'Linux'],
    pricingTiers: [{ name: 'Pro', price: '$20/mo', features: ['Composer'] }],
    specs: {
      contextWindow: '200k tokens',
      apiAvailable: false,
      selfHostable: false,
      privacyNoTraining: true,
      primaryInterface: 'Desktop App',
      primaryLanguageSupport: 'TypeScript, Python',
    },
    iconBg: '#000',
  },
  {
    id: 'tool-n8n',
    name: 'n8n',
    slug: 'n8n',
    tagline: 'Workflow automation',
    description: 'Self-hostable workflow automation tool with AI nodes.',
    category: 'Automation',
    pricingModel: 'Open Source',
    startingPrice: 'Free',
    officialUrl: 'https://n8n.io',
    featured: true,
    curatedRank: 2,
    addedYear: 2023,
    keyFeatures: ['Node canvas', 'AI agents'],
    pros: ['Self-hostable', 'Private'],
    cons: ['Requires Docker'],
    bestFor: 'Technical operations',
    platforms: ['Web', 'Self-Hosted'],
    pricingTiers: [{ name: 'Community', price: 'Free', features: ['Unlimited'] }],
    specs: {
      contextWindow: 'Configurable',
      apiAvailable: true,
      selfHostable: true,
      privacyNoTraining: true,
      primaryInterface: 'Web Canvas',
      primaryLanguageSupport: 'JavaScript',
    },
    iconBg: '#EA4B71',
  },
  {
    id: 'tool-whisper',
    name: 'Whisper',
    slug: 'whisper',
    tagline: 'Speech to text',
    description: 'Open-weight audio transcription and translation model.',
    category: 'Video',
    pricingModel: 'Open Source',
    startingPrice: 'Free',
    officialUrl: 'https://github.com/openai/whisper',
    featured: false,
    curatedRank: 3,
    addedYear: 2023,
    keyFeatures: ['Transcription', 'Punctuation'],
    pros: ['Completely offline', 'High accuracy'],
    cons: ['Needs GPU'],
    bestFor: 'Audio transcription',
    platforms: ['CLI', 'Python'],
    pricingTiers: [{ name: 'OSS', price: 'Free', features: ['MIT License'] }],
    specs: {
      contextWindow: '30s audio',
      apiAvailable: true,
      selfHostable: true,
      privacyNoTraining: true,
      primaryInterface: 'CLI',
      primaryLanguageSupport: 'All languages',
    },
    iconBg: '#333',
  },
];

test('normalizeText trims and lowercases input', () => {
  assert.equal(normalizeText('  CuRsOr  '), 'cursor');
  assert.equal(normalizeText('PROMPT ENGINEERING'), 'prompt engineering');
});

test('searchQueryMatches finds terms in name or features', () => {
  assert.equal(searchQueryMatches(mockTools[0], 'composer'), true);
  assert.equal(searchQueryMatches(mockTools[0], 'ide code'), true);
  assert.equal(searchQueryMatches(mockTools[0], 'nonexistentxyz'), false);
});

test('filterTools filters by category and pricing', () => {
  const codingOnly = filterTools(mockTools, {
    search: '',
    category: 'Coding',
    pricing: 'All',
    platform: 'All',
    sortBy: 'curated',
  });
  assert.equal(codingOnly.length, 1);
  assert.equal(codingOnly[0].id, 'tool-cursor');

  const openSourceOnly = filterTools(mockTools, {
    search: '',
    category: 'All',
    pricing: 'Open Source',
    platform: 'All',
    sortBy: 'curated',
  });
  assert.equal(openSourceOnly.length, 2);
});

test('calculateCategoryCounts counts items properly', () => {
  const counts = calculateCategoryCounts(mockTools);
  assert.equal(counts.All, 3);
  assert.equal(counts.Coding, 1);
  assert.equal(counts.Automation, 1);
  assert.equal(counts.Video, 1);
});

test('generateComparisonMatrix builds spec rows across selected tools', () => {
  const matrix = generateComparisonMatrix([mockTools[0], mockTools[1]]);
  assert.equal(matrix.length > 5, true);
  const selfHostRow = matrix.find((r) => r.id === 'selfHostable');
  assert.ok(selfHostRow);
  assert.equal(selfHostRow.values[0], 'No'); // Cursor
  assert.equal(selfHostRow.values[1], 'Yes'); // n8n
});

test('getRecommendedAlternatives excludes the target tool and limits results', () => {
  const alts = getRecommendedAlternatives(mockTools[0], mockTools, 2);
  assert.equal(alts.every((t) => t.id !== mockTools[0].id), true);
});
