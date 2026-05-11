import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const id = process.env.NEXT_PUBLIC_DEFAULT_SALON_ID

  // DEBUG LOG 1 — salon id .env.local'dan geliyor mu?
  console.log('[API] salon id:', id)

  const { data, error } = await supabase
    .from('salons')
    .select('plan_type')
    .eq('id', id!)
    .maybeSingle()

  // DEBUG LOG 2 & 3
  console.log('[API] data:', data)
  console.log('[API] error:', error)

  if (error || !data) {
    console.log('[API] Fallback: basic döndürülüyor — data veya error var')
    return NextResponse.json({ plan_type: 'basic' })
  }

  console.log('[API] Döndürülen plan_type:', data.plan_type)
  return NextResponse.json({ plan_type: data.plan_type })
}
