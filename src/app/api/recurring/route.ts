import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { RecurringData } from '@/types/deal'
import { getDateRange } from '@/lib/dateRange'

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
  const month = searchParams.get('month') ?? ''
  const proprietario = searchParams.get('proprietario') ?? ''
  const { from, to } = getDateRange(year, month)
  const supabase = getSupabase()

  let q = supabase
    .from('deals')
    .select('importo,importo_previsto,tipo_trattativa,proprietario')
    .gte('data_chiusura', from).lte('data_chiusura', to)
    .not('tipo_trattativa', 'is', null)
    .neq('tipo_trattativa', '')
  if (proprietario) q = q.eq('proprietario', proprietario)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const deals = (data ?? []) as Record<string, unknown>[]

  const ricorrenti = deals.filter(d => String(d.tipo_trattativa).toLowerCase().includes('ricorr'))
  const nuovi = deals.filter(d => !String(d.tipo_trattativa).toLowerCase().includes('ricorr'))

  const result: RecurringData = {
    per_tipo: group(deals, 'tipo_trattativa'),
    per_sales: group(deals, 'proprietario').slice(0, 10),
    ricorrente_importo: ricorrenti.reduce((s, d) => s + (Number(d.importo) || 0), 0),
    nuovo_importo: nuovi.reduce((s, d) => s + (Number(d.importo) || 0), 0),
    ricorrente_count: ricorrenti.length,
    nuovo_count: nuovi.length,
  }

  return NextResponse.json(result)
}
