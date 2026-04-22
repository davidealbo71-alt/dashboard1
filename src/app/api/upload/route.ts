import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function excelDateToISO(serial: number): string | null {
  if (!serial) return null
  const date = XLSX.SSF.parse_date_code(serial)
  if (!date) return null
  return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
}

function toBool(val: unknown): boolean {
  if (typeof val === 'boolean') return val
  if (typeof val === 'string') return val.toLowerCase() === 'true'
  return false
}

function toNum(val: unknown): number {
  const n = Number(val)
  return isNaN(n) ? 0 : n
}

function toInt(val: unknown): number | null {
  const n = parseInt(String(val))
  return isNaN(n) ? null : n
}

function toDate(val: unknown): string | null {
  if (typeof val === 'number') return excelDateToISO(val)
  if (typeof val === 'string' && val) return val
  return null
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'Nessun file fornito' }, { status: 400 })

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

  function pick(row: Record<string, unknown>, ...keys: string[]): unknown {
    for (const k of keys) if (row[k] !== undefined && row[k] !== null) return row[k]
    return undefined
  }

  const records = rows.map((row) => {
    const fase = String(pick(row, 'Fase trattativa') ?? '')
    const dataChiusura = toDate(pick(row, 'Data di chiusura', 'Data di chiusura - Giornaliero'))
    const annoFromData = dataChiusura ? parseInt(dataChiusura.substring(0, 4)) || null : null

    const vintaRaw = pick(row, 'È con chiusura vinta')
    const persa_raw = pick(row, 'È con chiusura persa')

    const vinta = vintaRaw !== undefined ? toBool(vintaRaw) : fase.toUpperCase().includes('WON')
    const persa = persa_raw !== undefined ? toBool(persa_raw) : fase.toUpperCase().includes('LOST')

    return {
      id_record: String(pick(row, 'ID record', 'ID RECORD (Testo)') ?? ''),
      nome_trattativa: String(pick(row, 'Nome trattativa') ?? ''),
      importo: toNum(pick(row, 'Importo')),
      fase_trattativa: fase,
      business_unit: String(pick(row, 'Business Unit') ?? ''),
      data_chiusura: dataChiusura,
      data_entrata_fase: toDate(pick(row, 'Data di entrata nella fase corrente')),
      proprietario: String(pick(row, 'Proprietario della trattativa') ?? ''),
      pipeline: String(pick(row, 'Pipeline') ?? ''),
      anno_competenza: toInt(pick(row, 'Anno di Competenza')) ?? annoFromData,
      azienda_associata: String(pick(row, 'Azienda Associata') ?? ''),
      vinta,
      persa,
      categoria_previsione: String(pick(row, 'Categoria di previsione') ?? ''),
      probabilita: toNum(pick(row, 'Probabilità trattativa')),
      service_line: String(pick(row, 'Service Line') ?? ''),
      importo_previsto: toNum(pick(row, 'Importo previsto offerta')),
      data_creazione: toDate(pick(row, 'Data di creazione', 'Data di creazione - Giornaliero')),
      tipo_trattativa: String(pick(row, 'Tipo di trattativa') ?? ''),
      motivo_lost: String(pick(row, 'Motivo della trattativa LOST') ?? ''),
      paese: String(pick(row, 'Paese della Trattativa') ?? ''),
    }
  })

  const supabase = getSupabase()
  await supabase.from('deals').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const BATCH = 200
  let inserted = 0
  for (let i = 0; i < records.length; i += BATCH) {
    const { error } = await supabase.from('deals').insert(records.slice(i, i + BATCH))
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    inserted += Math.min(BATCH, records.length - i)
  }

  const dateMatch = file.name.match(/(\d{4}-\d{2}-\d{2})/)
  if (dateMatch) {
    await supabase.from('metadata').upsert({ key: 'last_import_date', value: dateMatch[1] })
  }

  return NextResponse.json({ inserted })
}
