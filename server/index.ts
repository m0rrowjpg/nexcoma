import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { createClient } from '@supabase/supabase-js';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT ?? 8787);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const serviceUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const propertyId = process.env.GA4_PROPERTY_ID;
const serviceAccountEmail = process.env.GA4_CLIENT_EMAIL;
const serviceAccountKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n');

app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://www.googletagmanager.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: [
          "'self'",
          'https://*.supabase.co',
          'https://www.google-analytics.com',
          'https://analytics.google.com',
          'https://region1.google-analytics.com',
          'https://stats.g.doubleclick.net',
        ],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
      },
    },
  }),
);
app.use(express.json({ limit: '1mb' }));

const analyticsLimit = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

const adminSupabase =
  serviceUrl && serviceRoleKey
    ? createClient(serviceUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

async function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authorization = req.headers.authorization;
  const token = authorization?.toLowerCase().startsWith('bearer ')
    ? authorization.slice(7).trim()
    : undefined;
  if (!adminSupabase) {
    res.status(503).json({ error: 'Admin API authentication is not configured on the server.' });
    return;
  }
  if (!token) {
    res.status(401).json({ error: 'Admin authentication is required.' });
    return;
  }

  try {
    const { data, error } = await adminSupabase.auth.getUser(token);
    if (error || !data.user || data.user.app_metadata?.role !== 'admin') {
      res.status(403).json({ error: 'This account is not authorized to view admin analytics.' });
      return;
    }
  } catch (error) {
    console.error('Admin token verification failed:', error);
    res.status(500).json({ error: 'Could not verify admin access.' });
    return;
  }
  next();
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/analytics', analyticsLimit, requireAdmin, async (req, res) => {
  if (!propertyId || !serviceAccountEmail || !serviceAccountKey) {
    res.status(503).json({
      error: 'GA4 reporting is not configured. Set the GA4 property and service-account environment variables.',
    });
    return;
  }

  const days = Number(req.query.days);
  if (![7, 30, 90].includes(days)) {
    res.status(400).json({ error: 'Choose a supported reporting period: 7, 30, or 90 days.' });
    return;
  }

  try {
    const analytics = new BetaAnalyticsDataClient({
      credentials: { client_email: serviceAccountEmail, private_key: serviceAccountKey },
    });
    const property = `properties/${propertyId}`;
    const reportDateRange = { startDate: `${days - 1}daysAgo`, endDate: 'today' };
    const [overview, trend, sources, countries, pages, campaigns, realtime] = await Promise.all([
      analytics.runReport({
        property,
        dateRanges: [reportDateRange],
        metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }, { name: 'sessions' }],
      }),
      analytics.runReport({
        property,
        dateRanges: [reportDateRange],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),
      analytics.runReport({
        property,
        dateRanges: [reportDateRange],
        dimensions: [{ name: 'sessionSourceMedium' }],
        metrics: [{ name: 'sessions' }],
        limit: 8,
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      }),
      analytics.runReport({
        property,
        dateRanges: [reportDateRange],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }],
        limit: 8,
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      }),
      analytics.runReport({
        property,
        dateRanges: [reportDateRange],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        limit: 8,
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      }),
      analytics.runReport({
        property,
        dateRanges: [reportDateRange],
        dimensions: [{ name: 'sessionCampaignName' }],
        metrics: [{ name: 'sessions' }],
        limit: 8,
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      }),
      analytics.runRealtimeReport({
        property,
        metrics: [{ name: 'activeUsers' }],
      }),
    ]);

    const value = (report: typeof overview[0], rowIndex: number, metricIndex: number) =>
      Number(report.rows?.[rowIndex]?.metricValues?.[metricIndex]?.value ?? 0);
    const dimensions = (report: typeof overview[0], metricIndex: number) =>
      (report.rows ?? []).map((row) => ({
        label: row.dimensionValues?.[0]?.value ?? '(not set)',
        value: Number(row.metricValues?.[metricIndex]?.value ?? 0),
      }));
    const total = (report: typeof overview[0], metricIndex: number) =>
      Number(
        report.rows?.[0]?.metricValues?.[metricIndex]?.value
          ?? report.totals?.[0]?.metricValues?.[metricIndex]?.value
          ?? 0,
      );

    res.setHeader('Cache-Control', 'private, no-store');
    res.json({
      activeUsers: total(overview[0], 0),
      pageViews: total(overview[0], 1),
      sessions: total(overview[0], 2),
      realtimeUsers: value(realtime[0], 0, 0),
      trend: (trend[0].rows ?? []).map((row) => ({
        date: row.dimensionValues?.[0]?.value ?? '',
        visitors: Number(row.metricValues?.[0]?.value ?? 0),
        pageViews: Number(row.metricValues?.[1]?.value ?? 0),
      })),
      sources: dimensions(sources[0], 0),
      countries: dimensions(countries[0], 0),
      pages: dimensions(pages[0], 0),
      campaigns: dimensions(campaigns[0], 0),
    });
  } catch (error) {
    console.error('GA4 analytics request failed:', error);
    res.status(502).json({ error: 'GA4 could not return the requested reports. Check property access and reporting configuration.' });
  }
});

const dist = path.join(root, 'dist');
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(dist, 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Nexcoma server listening on port ${port}`);
});
