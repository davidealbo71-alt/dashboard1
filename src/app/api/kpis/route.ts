import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { Deal, KpiData } from '@/types/deal'

export const dynamic = 'force-dynamic'

function groupBy<T>(arr: T[], key: keyof T, importoKey: keyof T) {
  const map = new Map<string, { count: number; importo: number }>()
  for (const item of arr) {
    const label = String(item[key] || 'N/D')
    const prev = map.get(label) ?? { count: 0, importo: 0 }
    map.set(label, {
      count: prev.count + 1,
      importo: prev.importo + (Number(item[importoKey]) || 0),
    })
  }
  return Array.from(map.entries())
    .map(([label, v]) => ({ label, ...v }))
    .sort((a, b) => b.importo - a.importo)
}

export async function GET() {
  const { data, error } = await getSupabase()
    .from('deals')
    .select('importo,fase_trattativa,business_unit,proprietario,anno_competenza,vinta,persa')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const deals = (data ?? []) as Pick<Deal, 'importo' | 'fase_trattativa' | 'business_unit' | 'proprietario' | 'anno_competenza' | 'vinta' | 'persa'>[]

  const aperte = deals.filter((d) => !d.vinta && !d.persa)
  const vinte = deals.filter((d) => d.vinta)
  const chiuse = deals.filter((d) => d.vinta || d.persa)

  const kpi: KpiData = {
    pipeline_aperta: aperte.reduce((s, d) => s + (d.importo || 0), 0),
    totale_won: vinte.reduce((s, d) => s + (d.importo || 0), 0),
    win_rate: chiuse.length > 0 ? (vinte.length / chiuse.length) * 100 : 0,
    totale_trattative: deals.length,
    per_business_unit: groupBy(deals, 'business_unit', 'importo').slice(0, 8),
    per_fase: groupBy(deals, 'fase_trattativa', 'importo'),
    top_owners: groupBy(deals, 'proprietario', 'importo').slice(0, 10),
    per_anno: groupBy(deals, 'anno_competenza', 'importo').sort((a, b) => a.label.localeCompare(b.label)),
  }

  return NextResponse.json(kpi)
}
