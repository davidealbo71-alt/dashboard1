import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { Deal, GroupItem, KpiData } from '@/types/deal'

export const dynamic = 'force-dynamic'

type Row = Pick<Deal, 'importo' | 'importo_previsto' | 'fase_trattativa' | 'business_unit' | 'proprietario' | 'vinta' | 'persa'>

function groupBy(arr: Row[], key: keyof Row): GroupItem[] {
  const map = new Map<string, { count: number; importo: number; importo_pesato: number }>()
  for (const item of arr) {
    const label = String(item[key] ?? 'N/D') || 'N/D'
    const prev = map.get(label) ?? { count: 0, importo: 0, importo_pesato: 0 }
    map.set(label, {
      count: prev.count + 1,
      importo: prev.importo + (Number(item.importo) || 0),
      importo_pesato: prev.importo_pesato + (Number(item.importo_previsto) || 0),
    })
  }
  return Array.from(map.entries())
    .map(([label, v]) => ({ label, ...v }))
    .sort((a, b) => b.importo - a.importo)
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const year = searchParams.get('year') ?? '2026'
  const proprietario = searchParams.get('proprietario') ?? ''
  const supabase = getSupabase()

  // Anni disponibili
  const { data: allYears } = await supabase
    .from('deals')
    .select('data_chiusura')
    .not('data_chiusura', 'is', null)

  const anni = [...new Set(
    (allYears ?? []).map(r => r.data_chiusura?.slice(0, 4)).filter(Boolean)
  )].sort()

  // Proprietari disponibili per l'anno selezionato
  const { data: allProprietari } = await supabase
    .from('deals')
    .select('proprietario')
    .gte('data_chiusura', `${year}-01-01`)
    .lte('data_chiusura', `${year}-12-31`)

  const proprietari = [...new Set(
    (allProprietari ?? []).map(r => r.proprietario).filter(Boolean)
  )].sort()

  // Query principale filtrata per anno e opzionalmente per proprietario
  let query = supabase
    .from('deals')
    .select('importo,importo_previsto,fase_trattativa,business_unit,proprietario,vinta,persa')
    .gte('data_chiusura', `${year}-01-01`)
    .lte('data_chiusura', `${year}-12-31`)

  if (proprietario) query = query.eq('proprietario', proprietario)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const deals = (data ?? []) as Row[]
  const FASI_SOLIDE = ['Committed', 'Negotiation']
  const aperte = deals.filter(d => !d.vinta && !d.persa)
  const vinte = deals.filter(d => d.vinta)
  const chiuse = deals.filter(d => d.vinta || d.persa)
  const solide = deals.filter(d => FASI_SOLIDE.some(f => d.fase_trattativa?.includes(f)))

  const kpi: KpiData = {
    anno: Number(year),
    anni_disponibili: anni.map(Number),
    proprietari_disponibili: proprietari,
    pipeline_aperta: aperte.reduce((s, d) => s + (Number(d.importo) || 0), 0),
    pipeline_aperta_pesata: aperte.reduce((s, d) => s + (Number(d.importo_previsto) || 0), 0),
    totale_won: vinte.reduce((s, d) => s + (Number(d.importo) || 0), 0),
    totale_won_pesato: vinte.reduce((s, d) => s + (Number(d.importo_previsto) || 0), 0),
    win_rate: chiuse.length > 0 ? (vinte.length / chiuse.length) * 100 : 0,
    totale_trattative: deals.length,
    trattative_solide: solide.reduce((s, d) => s + (Number(d.importo) || 0), 0),
    trattative_solide_pesate: solide.reduce((s, d) => s + (Number(d.importo_previsto) || 0), 0),
    trattative_solide_count: solide.length,
    per_business_unit: groupBy(deals, 'business_unit').slice(0, 8),
    per_fase: groupBy(deals, 'fase_trattativa'),
    top_owners: groupBy(deals, 'proprietario').slice(0, 10),
  }

  return NextResponse.json(kpi)
}
