import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { LostData } from '@/types/deal'
import { getDateRangeMulti } from '@/lib/dateRange'

export const dynamic = 'force-dynamic'

function group(arr: Record<string, unknown>[], key: string) {
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
  const monthsParam = (searchParams.get('month') ?? '').split(',').filter(Boolean).map(Number)
  const proprietario = searchParams.get('proprietario') ?? ''
  const serviceLineFilter = (searchParams.get('service_line') ?? '').split(',').filter(Boolean)
  const faseFilter = (searchParams.get('fase_trattativa') ?? '').split(',').filter(Boolean)
  const { from, to, months: selectedMonths } = getDateRangeMulti(year, monthsParam)
  const supabase = getSupabase()

  let q = supabase
    .from('deals')
    .select('importo,importo_previsto,proprietario,azienda_associata,motivo_lost,data_chiusura')
    .gte('data_chiusura', from).lte('data_chiusura', to)
    .eq('persa', true)
  if (proprietario) q = q.eq('proprietario', proprietario)
  if (serviceLineFilter.length > 0) q = q.in('service_line', serviceLineFilter)
  if (faseFilter.length > 0) q = q.in('fase_trattativa', faseFilter)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const deals = (selectedMonths.length > 1
    ? (data ?? []).filter(d => {
        const dc = d.data_chiusura as string | null
        return dc && selectedMonths.includes(new Date(dc).getMonth() + 1)
      })
    : (data ?? [])) as Record<string, unknown>[]

  const result: LostData = {
    totale_persi: deals.length,
    importo_perso: deals.reduce((s, d) => s + (Number(d.importo) || 0), 0),
    per_sales: group(deals, 'proprietario').slice(0, 10),
    per_cliente: group(deals, 'azienda_associata').filter(c => c.label !== 'N/D').slice(0, 10),
    per_motivo: group(deals, 'motivo_lost').filter(m => m.label !== 'N/D').slice(0, 10),
  }

  return NextResponse.json(result)
}
