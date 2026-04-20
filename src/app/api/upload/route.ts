import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

  const records = rows.map((row) => ({
    name: String(row['name'] ?? row['Name'] ?? row['KPI'] ?? row['kpi'] ?? ''),
    value: Number(row['value'] ?? row['Value'] ?? row['valore'] ?? row['Valore'] ?? 0),
    unit: String(row['unit'] ?? row['Unit'] ?? row['unità'] ?? ''),
    category: String(row['category'] ?? row['Category'] ?? row['categoria'] ?? row['Categoria'] ?? ''),
    date: String(row['date'] ?? row['Date'] ?? row['data'] ?? row['Data'] ?? ''),
  })).filter((r) => r.name)

  const { data, error } = await supabase.from('kpis').insert(records).select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ inserted: data?.length ?? 0 })
}
