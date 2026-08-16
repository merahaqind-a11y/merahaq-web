-- Mera Haq — deck sync for the optional login (§10 of the design spec).
--
-- Run this in the Supabase SQL editor for project ntltnmqmcqurhidnxwqs.
-- It is idempotent: safe to run more than once.
--
-- WHAT THIS TABLE HOLDS, AND WHAT IT DELIBERATELY DOES NOT
--
-- It holds the OUTPUT deck, the matrix version, and the language. That is all.
--
-- It does NOT hold her answers, and it never will. The no-echo rule is the reason the
-- diagnostic computes client-side and throws the answers away: if the phone is
-- inspected — or if this database is ever breached, subpoenaed, or sold with the
-- company — there must be nothing in it that describes her marriage, her money, or
-- what is happening in her house. A deck of five card IDs describes a reading list.
--
-- The CHECK constraints below are defence in depth. Even a compromised client cannot
-- write a malformed or oversized payload into this table.

create table if not exists public.decks (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  deck        text[] not null,
  v           smallint not null,
  lang        text not null default 'hi',
  updated_at  timestamptz not null default now(),

  -- The deck is always exactly five cards, C8 always last (Diagnostic Spec §3.6).
  constraint deck_is_five
    check (array_length(deck, 1) = 5),

  -- Only real card IDs. Nothing else can be smuggled into this column.
  constraint deck_ids_valid
    check (deck <@ array['C1','C2','C3','C4','C5','C6','C7','C8','C9','C10']::text[]),

  -- C8 (free legal aid) is universal and always appended last.
  constraint deck_ends_with_c8
    check (deck[5] = 'C8'),

  constraint lang_valid
    check (lang in ('hi', 'hinglish', 'en'))
);

comment on table public.decks is
  'Output deck only. Never stores diagnostic answers - see the no-echo rule in the PRD.';

-- ─────────────────────────────────────────────────────────────────────────────
-- Row level security. A row is readable and writable only by the user it belongs
-- to. There is no service-role read path in the application, and no admin view.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.decks enable row level security;

drop policy if exists "decks_select_own" on public.decks;
create policy "decks_select_own"
  on public.decks for select
  using (auth.uid() = user_id);

drop policy if exists "decks_insert_own" on public.decks;
create policy "decks_insert_own"
  on public.decks for insert
  with check (auth.uid() = user_id);

drop policy if exists "decks_update_own" on public.decks;
create policy "decks_update_own"
  on public.decks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- She can delete her own row at any time, from the menu, without asking anyone.
drop policy if exists "decks_delete_own" on public.decks;
create policy "decks_delete_own"
  on public.decks for delete
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Keep updated_at honest without a client having to set it.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.decks_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists decks_touch on public.decks;
create trigger decks_touch
  before update on public.decks
  for each row execute function public.decks_touch_updated_at();
