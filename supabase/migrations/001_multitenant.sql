-- =============================================================
-- 001_multitenant.sql
-- Multi-tenant foundation: salons, visitor_profiles, campaigns
-- + salon_id FK additions to bookings & leads
-- + Row Level Security policies for tenant isolation
-- =============================================================

-- ── 1. ENUM ──────────────────────────────────────────────────
CREATE TYPE plan_type AS ENUM ('basic', 'pro', 'ai_plus');

-- ── 2. SALONS ────────────────────────────────────────────────
-- features JSONB örneği:
-- {"booking": true, "admin_panel": true, "ai_agent": false, "smart_campaigns": false}

CREATE TABLE salons (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text        NOT NULL,
  slug             text        NOT NULL UNIQUE,
  plan_type        plan_type   NOT NULL DEFAULT 'basic',
  plan_expires_at  timestamptz,
  features         jsonb       NOT NULL DEFAULT '{"booking":true,"admin_panel":true,"ai_agent":false,"smart_campaigns":false}'::jsonb,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_salons_slug ON salons (slug);

ALTER TABLE salons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "salons_isolation" ON salons
  FOR ALL
  USING (
    id::text = (current_setting('request.headers', true)::jsonb ->> 'x-salon-id')
  );

-- ── 3. VISITOR_PROFILES ──────────────────────────────────────
CREATE TABLE visitor_profiles (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id       uuid        NOT NULL REFERENCES salons (id) ON DELETE CASCADE,
  name           text,
  phone          text,
  purpose        text,
  skin_type      text,
  nail_type      text,
  budget         text,
  preferred_date date,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_visitor_profiles_salon_id ON visitor_profiles (salon_id);

ALTER TABLE visitor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "visitor_profiles_isolation" ON visitor_profiles
  FOR ALL
  USING (
    salon_id::text = (current_setting('request.headers', true)::jsonb ->> 'x-salon-id')
  );

-- ── 4. CAMPAIGNS ─────────────────────────────────────────────
CREATE TABLE campaigns (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id       uuid        NOT NULL REFERENCES salons (id) ON DELETE CASCADE,
  type           text        NOT NULL,
  discount_rate  numeric(5, 2),
  sent_at        timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_campaigns_salon_id ON campaigns (salon_id);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaigns_isolation" ON campaigns
  FOR ALL
  USING (
    salon_id::text = (current_setting('request.headers', true)::jsonb ->> 'x-salon-id')
  );

-- ── 5. BOOKINGS — salon_id FK ────────────────────────────────
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS salon_id uuid REFERENCES salons (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_salon_id ON bookings (salon_id);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings_isolation" ON bookings
  FOR ALL
  USING (
    salon_id IS NULL
    OR salon_id::text = (current_setting('request.headers', true)::jsonb ->> 'x-salon-id')
  );

-- ── 6. LEADS — salon_id FK ───────────────────────────────────
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS salon_id uuid REFERENCES salons (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_leads_salon_id ON leads (salon_id);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_isolation" ON leads
  FOR ALL
  USING (
    salon_id IS NULL
    OR salon_id::text = (current_setting('request.headers', true)::jsonb ->> 'x-salon-id')
  );