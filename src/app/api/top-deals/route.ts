import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getDateRange } from '@/lib/dateRange'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const year = searchParams.get('year') ?? '2026'
  const month = searchParams.get('month') ?? ''
  const proprietario = searchParams.get('proprietario') ?? ''
  const serviceLineFilter = (searchParams.get('service_line') ?? '').split(',').filter(Boolean)
  const { from, to } = getDateRange(year, month)

  let query = getSupabase()
    .from('deals')
    .select('nome_trattativa,azienda_associata,importo,importo_previsto,fase_trattativa,proprietario,data_chiusura,probabilita,vinta,persa')
    .gte('data_chiusura', from).lte('data_chiusura', to)
    .order('importo', { ascending: false })

  if (proprietario) query = query.eq('proprietario', proprietario)
  if (serviceLineFilter.length > 0) query = query.in('service_line', serviceLineFilter)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const result = (data ?? [])
    .filter(d => !d.vinta && !d.persa)
    .slice(0, 10)

  return NextResponse.json(result)
}
