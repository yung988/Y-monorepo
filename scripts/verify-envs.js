const { readFileSync, existsSync } = require('fs');
const { resolve } = require('path');

function parseEnv(content) {
  const result = {};
  const lines = content.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    result[key] = val;
  }
  return result;
}

function requireKeys(where, envObj, keys) {
  const missing = [];
  for (const k of keys) {
    if (!(k in envObj) || envObj[k] === '') missing.push(k);
  }
  if (missing.length) {
    throw new Error(`${where}: missing required keys: ${missing.join(', ')}`);
  }
}

function main() {
  const root = process.cwd();
  const fePath = resolve(root, 'Y-frontend', '.env');
  const bePath = resolve(root, 'Y-backend', '.env');

  if (!existsSync(fePath)) throw new Error('Y-frontend/.env not found. Run pnpm run env:merge');
  if (!existsSync(bePath)) throw new Error('Y-backend/.env not found. Run pnpm run env:merge');

  const fe = parseEnv(readFileSync(fePath, 'utf8'));
  const be = parseEnv(readFileSync(bePath, 'utf8'));

  // Frontend required keys per Y-frontend/src/lib/env.ts
  requireKeys('frontend', fe, [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_ADMIN_API_URL',
  ]);

  // Backend required keys per Y-backend/lib/env.ts
  requireKeys('backend', be, [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'STRIPE_SECRET_KEY',
    'RESEND_API_KEY',
    'EMAIL_FROM',
  ]);

  console.log('Env verification OK.');
}

try {
  main();
} catch (err) {
  console.error(String(err && err.message ? err.message : err));
  process.exit(1);
}
