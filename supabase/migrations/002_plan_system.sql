-- =============================================================
-- 002_plan_system.sql
-- Plan sistemi: salons tablosuna plan alanları ekle + test verisi
-- =============================================================

-- Plan şablonları (referans):
-- basic:   {"booking":false,"admin_panel":false,"lead_capture":true,"ai_agent":false,"smart_campaigns":false,"analytics":false}
-- pro:     {"booking":true,"admin_panel":true,"lead_capture":true,"ai_agent":false,"smart_campaigns":false,"analytics":false}
-- ai_plus: {"booking":true,"admin_panel":true,"lead_capture":true,"ai_agent":true,"smart_campaigns":true,"analytics":true}

ALTER TABLE salons
  ADD COLUMN IF NOT EXISTS plan_type TEXT
    DEFAULT 'basic'
    CHECK (plan_type IN ('basic', 'pro', 'ai_plus')),
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{
    "booking": false,
    "admin_panel": false,
    "lead_capture": false,
    "ai_agent": false,
    "smart_campaigns": false,
    "analytics": false
  }';

INSERT INTO salons (name, slug, plan_type, features)
VALUES (
  'Test Salon',
  'test-salon',
  'pro',
  '{"booking":true,"admin_panel":true,"lead_capture":true,"ai_agent":false,"smart_campaigns":false,"analytics":false}'
)
ON CONFLICT (slug) DO NOTHING;
