'use client'

import { useCallback, useEffect, useState } from 'react'
import { TrendingUp, Trophy, Target, BarChart2 } from 'lucide-react'
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
  const [pesato, setPesato] = useState(false)

  const fetchKpi = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/kpis')
    const data = await res.json()
    setKpi(data.error ? null : data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchKpi() }, [fetchKpi])

  const isEmpty = !kpi || kpi.totale_trattative === 0
  const perAnnoFiltered = kpi?.per_anno.filter(a => a.label !== 'N/D') ?? []
  const vKey = pesato ? 'importo_pesato' : 'importo'

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <BarChart2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">Dashboard Pipeline</h1>
              <p className="text-xs text-slate-400">HubSpot CRM · Dati aggiornati</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Toggle importo / pesato */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-medium">
              <button
                onClick={() => setPesato(false)}
                className={`rounded-md px-3 py-1.5 transition-colors ${!pesato ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Importo
              </button>
              <button
                onClick={() => setPesato(true)}
                className={`rounded-md px-3 py-1.5 transition-colors ${pesato ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Pesato
              </button>
            </div>
            <UploadExcel onUploadSuccess={fetchKpi} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6 space-y-6">

        {loading && (
          <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
            Caricamento dati...
          </div>
        )}

        {!loading && isEmpty && (
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-16 text-center">
            <BarChart2 className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">Nessun dato presente</p>
            <p className="text-slate-400 text-sm mt-1">Importa il file Excel HubSpot per iniziare</p>
          </div>
        )}

        {!loading && kpi && !isEmpty && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                title="Pipeline Aperta"
                value={eur(pesato ? kpi.pipeline_aperta_pesata : kpi.pipeline_aperta)}
                sub={`${kpi.per_fase.filter(f => f.label !== 'WON' && !f.label.toUpperCase().includes('LOST')).reduce((s, f) => s + f.count, 0)} trattative attive`}
                icon={TrendingUp}
                color="blue"
              />
              <StatCard
                title="Totale WON"
                value={eur(pesato ? kpi.totale_won_pesato : kpi.totale_won)}
                sub={`${kpi.per_fase.find(f => f.label === 'WON')?.count ?? 0} trattative vinte`}
                icon={Trophy}
                color="emerald"
              />
              <StatCard
                title="Win Rate"
                value={`${kpi.win_rate.toFixed(1)}%`}
                sub="su trattative chiuse"
                icon={Target}
                color="amber"
              />
              <StatCard
                title="Totale Trattative"
                value={kpi.totale_trattative.toLocaleString('it-IT')}
                sub="nel database"
                icon={BarChart2}
                color="rose"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <BarChart data={kpi.per_business_unit} title="Importo per Business Unit" valueKey={vKey} currency />
              <BarChart data={kpi.per_fase} title="Trattative per Fase" valueKey="count" currency={false} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <BarChart data={kpi.top_owners} title="Top Proprietari per Importo" valueKey={vKey} currency horizontal height={340} />
              <BarChart data={perAnnoFiltered} title="Pipeline per Anno di Competenza" valueKey={vKey} currency />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
