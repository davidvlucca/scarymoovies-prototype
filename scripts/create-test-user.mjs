/**
 * Creates a confirmed test user via Supabase admin API (Node.js only — service role key).
 * Run: node scripts/create-test-user.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const EMAIL = 'playwright.sp3@scarymoovies.dev';
const PASSWORD = 'VerifyStop3!';

// Delete existing test user if any
const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
const existing = existingUsers?.users?.find(u => u.email === EMAIL);
if (existing) {
  await supabaseAdmin.auth.admin.deleteUser(existing.id);
  console.log('Deleted existing test user:', existing.id);
}

// Create fresh test user (pre-confirmed)
const { data, error } = await supabaseAdmin.auth.admin.createUser({
  email: EMAIL,
  password: PASSWORD,
  email_confirm: true,
});

if (error) {
  console.error('Failed to create user:', error.message);
  process.exit(1);
}

console.log('Created test user:');
console.log('  id:', data.user.id);
console.log('  email:', data.user.email);
console.log('  confirmed:', !!data.user.email_confirmed_at);

// Verify the credentials work by signing in
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const { data: session, error: signInError } = await supabaseAnon.auth.signInWithPassword({
  email: EMAIL,
  password: PASSWORD,
});
if (signInError) {
  console.error('Sign-in verification failed:', signInError.message);
  process.exit(1);
}
console.log('  sign-in verified ✅  (access token prefix:', session.session?.access_token?.slice(0, 20) + '...)');
await supabaseAnon.auth.signOut();
