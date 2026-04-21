import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getDateRange } from '@/lib/dateRange'

export const dynamic = 'force-dynamic'

const FASI_SOLIDE = ['Committed', 'Negotiation']

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const year = searchParams.get('year') ?? '2026'
  const month = searchParams.get('month') ?? ''
  const proprietario = searchParams.get('proprietario') ?? ''
  const serviceLineFilter = (searchParams.get('service_line') ?? '').split(',').filter(Boolean)
  const supabase = getSupabase()

  const { from, to } = getDateRange(year, month)

  let q = supabase
    .from('deals')
    .select('nome_trattativa,azienda_associata,importo,importo_previsto,fase_trattativa,proprietario,data_chiusura,data_creazione,probabilita,vinta,persa')
    .gte('data_chiusura', from)
    .lte('data_chiusura', to)

  if (proprietario) q = q.eq('proprietario', proprietario)
  if (serviceLineFilter.length > 0) q = q.in('service_line', serviceLineFilter)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const solide = (data ?? [])
    .filter(d => !d.vinta && !d.persa)
    .filter(d => FASI_SOLIDE.some(f => d.fase_trattativa?.includes(f)))
    .sort((a, b) => (b.importo || 0) - (a.importo || 0))

  return NextResponse.json(solide)
}
