import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data } = await getSupabase()
    .from('metadata')
    .select('key,value')

  const map: Record<string, string> = {}
  for (const row of data ?? []) map[row.key] = row.value
  return NextResponse.json(map)
}
