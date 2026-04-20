export interface KpiRecord {
  id: string
  name: string
  value: number
  unit?: string
  category?: string
  date?: string
  created_at: string
}

export interface KpiGroup {
  category: string
  items: KpiRecord[]
}
