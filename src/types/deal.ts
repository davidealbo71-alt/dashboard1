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

export interface GroupItem {
  label: string
  count: number
  importo: number
  importo_pesato: number
}

export interface KpiData {
  anno: number
  anni_disponibili: number[]
  proprietari_disponibili: string[]
  pipeline_aperta: number
  pipeline_aperta_pesata: number
  totale_won: number
  totale_won_pesato: number
  win_rate: number
  totale_trattative: number
  trattative_solide: number
  trattative_solide_pesate: number
  trattative_solide_count: number
  per_business_unit: GroupItem[]
  per_fase: GroupItem[]
  top_owners: GroupItem[]
}
