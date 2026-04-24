import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getDateRangeMulti } from '@/lib/dateRange'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const year = searchParams.get('year') ?? '2026'
  const monthsParam = (searchParams.get('month') ?? '').split(',').filter(Boolean).map(Number)
  const proprietario = searchParams.get('proprietario') ?? ''
  const serviceLineFilter = (searchParams.get('service_line') ?? '').split(',').filter(Boolean)
  const supabase = getSupabase()

  const { from, to, months: selectedMonths } = getDateRangeMulti(year, monthsParam)

  let q = supabase
    .from('deals')
    .select('nome_trattativa,azienda_associata,importo,importo_previsto,fase_trattativa,proprietario,data_chiusura,data_creazione,probabilita,service_line')
    .eq('vinta', true)
    .gte('data_chiusura', from)
    .lte('data_chiusura', to)

  if (proprietario) q = q.eq('proprietario', proprietario)
  if (serviceLineFilter.length > 0) q = q.in('service_line', serviceLineFilter)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const won = (data ?? [])
    .filter(d => selectedMonths.length <= 1 || (d.data_chiusura && selectedMonths.includes(new Date(d.data_chiusura).getMonth() + 1)))
    .sort((a, b) => {
      if (!a.data_chiusura && !b.data_chiusura) return 0
      if (!a.data_chiusura) return 1
      if (!b.data_chiusura) return -1
      return new Date(b.data_chiusura).getTime() - new Date(a.data_chiusura).getTime()
    })

  return NextResponse.json(won)
}
