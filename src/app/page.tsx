'use client'

import { useCallback, useEffect, useState } from 'react'
import { KpiCard } from '@/components/KpiCard'
import { KpiChart } from '@/components/KpiChart'
import { UploadExcel } from '@/components/UploadExcel'
import { KpiRecord } from '@/types/kpi'

export default function HomePage() {
  const [kpis, setKpis] = useState<KpiRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetchKpis = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/kpis')
    const data = await res.json()
    setKpis(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchKpis() }, [fetchKpis])

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard KPI</h1>
          <UploadExcel onUploadSuccess={fetchKpis} />
        </div>

        {loading && <p className="text-muted-foreground">Caricamento...</p>}

        {!loading && kpis.length === 0 && (
          <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
            Nessun KPI presente. Importa un file Excel per iniziare.
          </div>
        )}

        {kpis.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {kpis.map((kpi) => (
                <KpiCard key={kpi.id} kpi={kpi} />
              ))}
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Grafico KPI</h2>
              <KpiChart kpis={kpis} />
            </div>
          </>
        )}
      </div>
    </main>
  )
}
