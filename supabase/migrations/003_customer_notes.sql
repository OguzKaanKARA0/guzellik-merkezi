-- =====================================================
-- Migration: customer_notes tablosu
-- Müşteriye özel notları saklar (phone ile eşleşir)
-- =====================================================

create table if not exists public.customer_notes (
  phone       text primary key,
  note        text not null default '',
  updated_at  timestamptz not null default now()
);

-- RLS etkinleştir
alter table public.customer_notes enable row level security;

-- Sadece service_role okuyup yazabilir (admin actions)
create policy "service_role_full_access" on public.customer_notes
  for all
  using (true)
  with check (true);

-- Yorum: Anon key ile erişim kapalı, sadece service_role key ile
--        (AdminDashboardClient actions.ts üzerinden) erişilir.
