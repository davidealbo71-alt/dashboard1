export interface Deal {
  id: string
  id_record: string
  nome_trattativa: string
  importo: number
  fase_trattativa: string
  business_unit: string
  data_chiusura: string | null
  proprietario: string
  pipeline: string
  anno_competenza: number | null
  azienda_associata: string
  vinta: boolean
  persa: boolean
  categoria_previsione: string
  probabilita: number
  service_line: string
  importo_previsto: number
  paese: string
  created_at: string
}

export interface KpiData {
  pipeline_aperta: number
  totale_won: number
  win_rate: number
  totale_trattative: number
  per_business_unit: { label: string; importo: number; count: number }[]
  per_fase: { label: string; count: number; importo: number }[]
  top_owners: { label: string; importo: number; count: number }[]
  per_anno: { label: string; importo: number; count: number }[]
}
