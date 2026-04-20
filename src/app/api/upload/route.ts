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

  const records = rows.map((row) => ({
    id_record: String(row['ID record'] ?? ''),
    nome_trattativa: String(row['Nome trattativa'] ?? ''),
    importo: toNum(row['Importo']),
    fase_trattativa: String(row['Fase trattativa'] ?? ''),
    business_unit: String(row['Business Unit'] ?? ''),
    data_chiusura: toDate(row['Data di chiusura']),
    data_entrata_fase: toDate(row['Data di entrata nella fase corrente']),
    proprietario: String(row['Proprietario della trattativa'] ?? ''),
    pipeline: String(row['Pipeline'] ?? ''),
    anno_competenza: toInt(row['Anno di Competenza']),
    azienda_associata: String(row['Azienda Associata'] ?? ''),
    vinta: toBool(row['È con chiusura vinta']),
    persa: toBool(row['È con chiusura persa']),
    categoria_previsione: String(row['Categoria di previsione'] ?? ''),
    probabilita: toNum(row['Probabilità trattativa']),
    service_line: String(row['Service Line'] ?? ''),
    importo_previsto: toNum(row['Importo previsto offerta']),
    tipo_trattativa: String(row['Tipo di trattativa'] ?? ''),
    motivo_lost: String(row['Motivo della trattativa LOST'] ?? ''),
    paese: String(row['Paese della Trattativa'] ?? ''),
  }))

  const supabase = getSupabase()
  await supabase.from('deals').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const BATCH = 200
  let inserted = 0
  for (let i = 0; i < records.length; i += BATCH) {
    const { error } = await supabase.from('deals').insert(records.slice(i, i + BATCH))
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    inserted += Math.min(BATCH, records.length - i)
  }

  return NextResponse.json({ inserted })
}
