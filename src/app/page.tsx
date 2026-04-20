'use client'

import { useCallback, useEffect, useState } from 'react'
import { StatCard } from '@/components/StatCard'
import { BarChart } from '@/components/BarChart'
import { UploadExcel } from '@/components/UploadExcel'
import { KpiData } from '@/types/deal'

function eur(v: number) {
  return '€' + v.toLocaleString('it-IT', { maximumFractionDigits: 0 })
}

export default function HomePage() {
  const [kpi, setKpi] = useState<KpiData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchKpi = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/kpis')
    const data = await res.json()
    setKpi(data.error ? null : data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchKpi() }, [fetchKpi])

  const isEmpty = !kpi || kpi.totale_trattative === 0

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Pipeline Commerciale</h1>
            <p className="text-sm text-muted-foreground">Dati HubSpot CRM</p>
          </div>
          <UploadExcel onUploadSuccess={fetchKpi} />
        </div>

        {loading && <p className="text-muted-foreground">Caricamento...</p>}

        {!loading && isEmpty && (
          <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
            Nessun dato presente. Importa il file Excel HubSpot per iniziare.
          </div>
        )}

        {!loading && kpi && !isEmpty && (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                title="Pipeline Aperta"
                value={eur(kpi.pipeline_aperta)}
                sub={`${kpi.per_fase.filter(f => f.label !== 'WON' && !f.label.toLowerCase().includes('lost')).reduce((s,f)=>s+f.count,0)} trattative attive`}
              />
              <StatCard
                title="Totale WON"
                value={eur(kpi.totale_won)}
                sub={`${kpi.per_fase.find(f => f.label === 'WON')?.count ?? 0} trattative vinte`}
              />
              <StatCard
                title="Win Rate"
                value={`${kpi.win_rate.toFixed(1)}%`}
                sub="su trattative chiuse"
              />
              <StatCard
                title="Totale Trattative"
                value={kpi.totale_trattative.toLocaleString('it-IT')}
                sub="nel database"
              />
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <BarChart
                data={kpi.per_business_unit}
                title="Importo per Business Unit"
                valueKey="importo"
                currency
              />
              <BarChart
                data={kpi.per_fase}
                title="Trattative per Fase (n°)"
                valueKey="count"
                currency={false}
              />
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <BarChart
                data={kpi.top_owners}
                title="Top Proprietari per Importo"
                valueKey="importo"
                currency
                horizontal
                height={320}
              />
              <BarChart
                data={kpi.per_anno}
                title="Pipeline per Anno di Competenza"
                valueKey="importo"
                currency
              />
            </div>
          </>
        )}
      </div>
    </main>
  )
}
