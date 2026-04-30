import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getDateRangeMulti } from '@/lib/dateRange'

export const dynamic = 'force-dynamic'

const FASI_SOLIDE = ['Committed', 'Negotiation']

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const year = searchParams.get('year') ?? '2026'
  const monthsParam = (searchParams.get('month') ?? '').split(',').filter(Boolean).map(Number)
  const proprietario = searchParams.get('proprietario') ?? ''
  const serviceLineFilter = (searchParams.get('service_line') ?? '').split(',').filter(Boolean)
  const faseFilter = (searchParams.get('fase_trattativa') ?? '').split(',').filter(Boolean)
  const supabase = getSupabase()

  const { from, to, months: selectedMonths } = getDateRangeMulti(year, monthsParam)

  let q = supabase
    .from('deals')
    .select('nome_trattativa,azienda_associata,importo,importo_previsto,fase_trattativa,proprietario,data_chiusura,data_creazione,probabilita,vinta,persa,margine')
    .gte('data_chiusura', from)
    .lte('data_chiusura', to)

  if (proprietario) q = q.eq('proprietario', proprietario)
  if (serviceLineFilter.length > 0) q = q.in('service_line', serviceLineFilter)
  if (faseFilter.length > 0) q = q.in('fase_trattativa', faseFilter)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const solide = (data ?? [])
    .filter(d => selectedMonths.length <= 1 || (d.data_chiusura && selectedMonths.includes(new Date(d.data_chiusura).getMonth() + 1)))
    .filter(d => !d.vinta && !d.persa)
    .filter(d => FASI_SOLIDE.some(f => d.fase_trattativa?.includes(f)))
    .sort((a, b) => (b.importo || 0) - (a.importo || 0))

  return NextResponse.json(solide)
}
