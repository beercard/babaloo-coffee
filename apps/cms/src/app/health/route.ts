/**
 * GET /health — deployment self-check that works even when Payload cannot initialise.
 * Reports which settings are present (never their values) and whether the database answers.
 */
import { createClient } from '@libsql/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.DATABASE_URL ?? '';
  const scheme = url.includes('://') ? url.split('://')[0] : url.startsWith('file:') ? 'file' : url ? 'unknown' : 'missing';
  const report: Record<string, unknown> = {
    nodeEnv: process.env.NODE_ENV,
    payloadSecret: Boolean(process.env.PAYLOAD_SECRET),
    database: { scheme, hasAuthToken: Boolean(process.env.DATABASE_AUTH_TOKEN), hasWhitespace: url !== url.trim() },
    blobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOBB_READ_WRITE_TOKEN),
    smtp: Boolean(process.env.SMTP_HOST),
    serverUrl: process.env.PAYLOAD_PUBLIC_SERVER_URL ?? null,
    siteUrl: process.env.SITE_URL ?? null,
  };
  if (scheme === 'libsql' || scheme === 'https' || scheme === 'wss') {
    const started = Date.now();
    try {
      const client = createClient({ url: url.trim(), authToken: process.env.DATABASE_AUTH_TOKEN?.trim() });
      const tables = await client.execute("select name from sqlite_master where type='table' and name not like 'sqlite_%' order by name");
      report.database = { ...(report.database as object), reachable: true, ms: Date.now() - started, tables: tables.rows.length, sample: tables.rows.slice(0, 5).map((r) => r.name) };
    } catch (err) {
      report.database = { ...(report.database as object), reachable: false, ms: Date.now() - started, error: err instanceof Error ? err.message : String(err) };
    }
  }
  return Response.json(report, { headers: { 'Cache-Control': 'no-store' } });
}
