import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const STALLO_GIORNI = 60

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const year = searchParams.get('year') ?? '2026'
  const proprietario = searchParams.get('proprietario') ?? ''
  const serviceLineFilter = (searchParams.get('service_line') ?? '').split(',').filter(Boolean)
  const faseFilter = (searchParams.get('fase_trattativa') ?? '').split(',').filter(Boolean)
  const supabase = getSupabase()

  // Stallo: filtra per anno (ignora mese — un deal bloccato è bloccato indipendentemente dal mese di chiusura previsto)
  let q = supabase
    .from('deals')
    .select('nome_trattativa,azienda_associata,importo,importo_previsto,fase_trattativa,proprietario,data_chiusura,data_entrata_fase,data_creazione,probabilita,vinta,persa')
    .gte('data_chiusura', `${year}-01-01`)
    .lte('data_chiusura', `${year}-12-31`)
    .not('data_entrata_fase', 'is', null)

  if (proprietario) q = q.eq('proprietario', proprietario)
  if (serviceLineFilter.length > 0) q = q.in('service_line', serviceLineFilter)
  if (faseFilter.length > 0) q = q.in('fase_trattativa', faseFilter)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const today = new Date()
  const stallo = (data ?? [])
    .filter(d => !d.vinta && !d.persa)
    .map(d => ({
      ...d,
      giorni_in_fase: Math.floor((today.getTime() - new Date(d.data_entrata_fase).getTime()) / 86400000),
    }))
    .filter(d => d.giorni_in_fase > STALLO_GIORNI)
    .sort((a, b) => b.giorni_in_fase - a.giorni_in_fase)

  return NextResponse.json(stallo)
}
