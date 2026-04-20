import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getDateRange } from '@/lib/dateRange'

export const dynamic = 'force-dynamic'

const STALLO_GIORNI = 60

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const year = searchParams.get('year') ?? '2026'
  const month = searchParams.get('month') ?? ''
  const proprietario = searchParams.get('proprietario') ?? ''
  const { from, to } = getDateRange(year, month)
  const supabase = getSupabase()

  let q = supabase
    .from('deals')
    .select('nome_trattativa,azienda_associata,importo,importo_previsto,fase_trattativa,proprietario,data_chiusura,data_entrata_fase,data_creazione,probabilita')
    .gte('data_chiusura', from)
    .lte('data_chiusura', to)
    .eq('vinta', false)
    .eq('persa', false)
    .not('data_entrata_fase', 'is', null)

  if (proprietario) q = q.eq('proprietario', proprietario)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const today = new Date()
  const stallo = (data ?? [])
    .map(d => ({
      ...d,
      giorni_in_fase: Math.floor((today.getTime() - new Date(d.data_entrata_fase).getTime()) / 86400000),
    }))
    .filter(d => d.giorni_in_fase > STALLO_GIORNI)
    .sort((a, b) => b.giorni_in_fase - a.giorni_in_fase)

  return NextResponse.json(stallo)
}
