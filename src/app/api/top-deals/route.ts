import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getDateRange } from '@/lib/dateRange'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const year = searchParams.get('year') ?? '2026'
  const month = searchParams.get('month') ?? ''
  const proprietario = searchParams.get('proprietario') ?? ''
  const { from, to } = getDateRange(year, month)

  let query = getSupabase()
    .from('deals')
    .select('nome_trattativa,azienda_associata,importo,importo_previsto,fase_trattativa,proprietario,data_chiusura,probabilita')
    .gte('data_chiusura', from).lte('data_chiusura', to)
    .eq('vinta', false).eq('persa', false)
    .order('importo', { ascending: false })
    .limit(10)

  if (proprietario) query = query.eq('proprietario', proprietario)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data ?? [])
}
