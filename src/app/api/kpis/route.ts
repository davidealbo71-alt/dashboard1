import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { GroupItem, KpiData } from '@/types/deal'
import { getDateRange } from '@/lib/dateRange'

export const dynamic = 'force-dynamic'

const FASI_SOLIDE = ['Committed', 'Negotiation']
const STALLO_GIORNI = 60

const FUNNEL_ORDER = ['Initial Meeting', 'Initial meeting', 'Engaging', 'Proposing', 'PoC', 'Committed', 'Negotiation', 'WON']

type Row = {
  importo: number
  importo_previsto: number
  fase_trattativa: string
  business_unit: string
  proprietario: string
  azienda_associata: string
  service_line: string
  vinta: boolean
  persa: boolean
  data_entrata_fase: string | null
}

function groupBy(arr: Row[], key: keyof Row): GroupItem[] {
  const map = new Map<string, { count: number; importo: number; importo_pesato: number }>()
  for (const item of arr) {
    const label = String(item[key] ?? '') || 'N/D'
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
  const month = searchParams.get('month') ?? ''
  const proprietario = searchParams.get('proprietario') ?? ''
  const serviceLineFilter = (searchParams.get('service_line') ?? '').split(',').filter(Boolean)
  const { from, to } = getDateRange(year, month)
  const supabase = getSupabase()

  const { data: allYears } = await supabase
    .from('deals').select('data_chiusura').not('data_chiusura', 'is', null)
  const anni = [...new Set((allYears ?? []).map(r => r.data_chiusura?.slice(0, 4)).filter(Boolean))].sort()

  const { data: allProp } = await supabase
    .from('deals').select('proprietario,service_line')
    .gte('data_chiusura', `${year}-01-01`).lte('data_chiusura', `${year}-12-31`)
  const proprietari = [...new Set((allProp ?? []).map(r => r.proprietario).filter(Boolean))].sort()
  const serviceLines = [...new Set((allProp ?? []).map(r => r.service_line).filter(Boolean))].sort()

  let q = supabase
    .from('deals')
    .select('importo,importo_previsto,fase_trattativa,business_unit,proprietario,azienda_associata,service_line,vinta,persa,data_entrata_fase')
    .gte('data_chiusura', from).lte('data_chiusura', to)
  if (proprietario) q = q.eq('proprietario', proprietario)
  if (serviceLineFilter.length > 0) q = q.in('service_line', serviceLineFilter)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const deals = (data ?? []) as Row[]
  const aperte = deals.filter(d => !d.vinta && !d.persa)
  const vinte = deals.filter(d => d.vinta)
  const chiuse = deals.filter(d => d.vinta || d.persa)
  const solide = deals.filter(d => FASI_SOLIDE.some(f => d.fase_trattativa?.includes(f)))

  const today = new Date()
  const stallo = aperte.filter(d => {
    if (!d.data_entrata_fase) return false
    const diff = (today.getTime() - new Date(d.data_entrata_fase).getTime()) / 86400000
    return diff > STALLO_GIORNI
  })

  // Funnel: ordine logico delle fasi
  const faseMap = groupBy(deals, 'fase_trattativa')
  const funnel: GroupItem[] = []
  for (const label of FUNNEL_ORDER) {
    const found = faseMap.find(f => f.label.toLowerCase().startsWith(label.toLowerCase()))
    if (found) funnel.push(found)
  }

  const kpi: KpiData = {
    anno: Number(year),
    anni_disponibili: anni.map(Number),
    proprietari_disponibili: proprietari,
    service_line_disponibili: serviceLines,
    pipeline_aperta: aperte.reduce((s, d) => s + (Number(d.importo) || 0), 0),
    pipeline_aperta_pesata: aperte.reduce((s, d) => s + (Number(d.importo_previsto) || 0), 0),
    totale_won: vinte.reduce((s, d) => s + (Number(d.importo) || 0), 0),
    totale_won_pesato: vinte.reduce((s, d) => s + (Number(d.importo_previsto) || 0), 0),
    win_rate: chiuse.length > 0 ? (vinte.length / chiuse.length) * 100 : 0,
    totale_trattative: deals.length,
    importo_medio: aperte.length > 0 ? aperte.reduce((s, d) => s + (Number(d.importo) || 0), 0) / aperte.length : 0,
    stallo_count: stallo.length,
    stallo_importo: stallo.reduce((s, d) => s + (Number(d.importo) || 0), 0),
    trattative_solide: solide.reduce((s, d) => s + (Number(d.importo) || 0), 0),
    trattative_solide_pesate: solide.reduce((s, d) => s + (Number(d.importo_previsto) || 0), 0),
    trattative_solide_count: solide.length,
    per_business_unit: groupBy(deals, 'business_unit').slice(0, 8),
    per_fase: groupBy(deals, 'fase_trattativa'),
    per_service_line: groupBy(deals, 'service_line').filter(s => s.label !== 'N/D').slice(0, 8),
    per_cliente: groupBy(deals, 'azienda_associata').filter(c => c.label !== 'N/D').slice(0, 10),
    top_owners: groupBy(deals, 'proprietario').slice(0, 10),
    funnel,
  }

  return NextResponse.json(kpi)
}
