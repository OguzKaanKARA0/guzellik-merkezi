'use client'

import { useEffect, useState } from 'react'

type FeatureKey =
  | 'booking'
  | 'admin_panel'
  | 'lead_capture'
  | 'ai_agent'
  | 'smart_campaigns'
  | 'analytics'

type PlanType = 'basic' | 'pro' | 'ai_plus'

const PLAN_FEATURES: Record<PlanType, Record<FeatureKey, boolean>> = {
  basic: {
    booking: false,
    admin_panel: false,
    lead_capture: true,
    ai_agent: false,
    smart_campaigns: false,
    analytics: false,
  },
  pro: {
    booking: true,
    admin_panel: true,
    lead_capture: true,
    ai_agent: false,
    smart_campaigns: false,
    analytics: false,
  },
  ai_plus: {
    booking: true,
    admin_panel: true,
    lead_capture: true,
    ai_agent: true,
    smart_campaigns: true,
    analytics: true,
  },
}

export type UseFeatureResult = { value: boolean; loading: boolean }

export function useFeature(feature: FeatureKey): UseFeatureResult {
  const [value,   setValue]   = useState(false)
  const [loading, setLoading] = useState(true)   // true until fetch completes

  useEffect(() => {
    fetch('/api/feature')
      .then((res) => res.json())
      .then(({ plan_type }) => {
        const plan   = (plan_type as PlanType) ?? 'basic'
        const result = PLAN_FEATURES[plan]?.[feature] ?? false
        setValue(result)
      })
      .catch(() => {
        // network error → keep value=false (safe default)
      })
      .finally(() => {
        setLoading(false)   // always stop loading, even on error
      })
  }, [feature])

  return { value, loading }
}
