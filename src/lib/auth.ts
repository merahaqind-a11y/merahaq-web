import type { CardId, Lang, Prefs } from './types';
import { readPrefs, writePrefs } from './prefs';

/**
 * Optional, non-blocking login (§10 of the design spec).
 *
 * Three rules that are not negotiable:
 *
 *   1. Login is NEVER required for anything. localStorage stays the default
 *      persistence exactly as the PRD specifies; skipping loses nothing.
 *   2. The synced row is `{ deck, v, lang }` and nothing else. The no-echo rule
 *      survives into the account — her answers are not stored here because they are
 *      not stored anywhere.
 *   3. No phone-number auth, ever. The PRD's reasoning about phone numbers on shared
 *      devices stands, and a phone number is the single most identifying thing we
 *      could ask a woman on a monitored device for.
 *
 * When the environment variables are absent the whole module degrades to a no-op and
 * the login surfaces do not render. It never throws and never blocks a page.
 */

const URL_ = import.meta.env['PUBLIC_SUPABASE_URL'] as string | undefined;
const KEY = import.meta.env['PUBLIC_SUPABASE_ANON_KEY'] as string | undefined;

/**
 * Google OAuth is off in the project as configured (auth settings report
 * `google: false`). Enabling it needs a Google Cloud OAuth client wired in the
 * Supabase dashboard. Until then the button is not rendered, rather than rendered and
 * broken — flip this once the provider is actually enabled.
 */
export const GOOGLE_ENABLED = import.meta.env['PUBLIC_SUPABASE_GOOGLE'] === 'true';

export function authAvailable(): boolean {
  return Boolean(URL_ && KEY);
}

type Client = import('@supabase/supabase-js').SupabaseClient;

let clientPromise: Promise<Client | null> | null = null;

/**
 * The Supabase SDK is ~40 KB gz and is needed by exactly one optional surface, so it
 * is dynamically imported on first use. It never enters the /shuru or card bundles.
 */
async function client(): Promise<Client | null> {
  if (!authAvailable()) return null;
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(URL_!, KEY!, {
        auth: {
          // No OAuth state or tokens in the URL bar longer than necessary — the URL is
          // the most visible thing on a shared phone.
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true,
        },
      }),
    );
  }
  return clientPromise;
}

/** Email magic link. The only first-party method — no password to remember or leak. */
export async function signInWithEmail(email: string): Promise<{ ok: boolean; message?: string }> {
  const c = await client();
  if (!c) return { ok: false };
  const { error } = await c.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${location.origin}/aapke-card` },
  });
  return error ? { ok: false, message: error.message } : { ok: true };
}

export async function signInWithGoogle(): Promise<void> {
  if (!GOOGLE_ENABLED) return;
  const c = await client();
  if (!c) return;
  await c.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${location.origin}/aapke-card` },
  });
}

export async function signOut(): Promise<void> {
  const c = await client();
  await c?.auth.signOut();
}

export async function currentUserId(): Promise<string | null> {
  const c = await client();
  if (!c) return null;
  const { data } = await c.auth.getUser();
  return data.user?.id ?? null;
}

/**
 * Push the local deck up. Output only — `readPrefs()` returns no answer fields
 * because none are ever written, and this picks three of them explicitly rather than
 * spreading the object, so a future field cannot leak by accident.
 */
export async function syncUp(): Promise<void> {
  const c = await client();
  if (!c) return;
  const userId = await currentUserId();
  if (!userId) return;

  const prefs: Prefs = readPrefs();
  if (prefs.deck.length !== 5) return; // never write a malformed deck

  await c.from('decks').upsert(
    { user_id: userId, deck: prefs.deck, v: prefs.v, lang: prefs.lang },
    { onConflict: 'user_id' },
  );
}

/** Pull a stored deck down onto a new device. Local wins if one already exists. */
export async function syncDown(): Promise<CardId[] | null> {
  const c = await client();
  if (!c) return null;
  const userId = await currentUserId();
  if (!userId) return null;

  const { data, error } = await c
    .from('decks')
    .select('deck, v, lang')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;

  const deck = data.deck as CardId[];
  if (!Array.isArray(deck) || deck.length !== 5) return null;

  writePrefs({ deck, v: data.v as number, lang: data.lang as Lang });
  return deck;
}
