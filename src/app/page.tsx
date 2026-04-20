'use client'

import { useCallback, useEffect, useState } from 'react'
import { TrendingUp, Trophy, Target, BarChart2, Calendar } from 'lucide-react'
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
  const [anno, setAnno] = useState(2026)

  const fetchKpi = useCallback(async (year: number) => {
    setLoading(true)
    const res = await fetch(`/api/kpis?year=${year}`)
    const data = await res.json()
    setKpi(data.error ? null : data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchKpi(anno) }, [fetchKpi, anno])

  const isEmpty = !kpi || kpi.totale_trattative === 0
  const perBuFiltered = kpi?.per_business_unit.filter(b => b.label === 'Digital Platform') ?? []

  return (
    <div className="min-h-screen bg-slate-50">

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
            {/* Selettore anno */}
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Anno</span>
              <select
                value={anno}
                onChange={e => setAnno(Number(e.target.value))}
                className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer"
              >
                {(kpi?.anni_disponibili ?? [anno]).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <UploadExcel onUploadSuccess={() => fetchKpi(anno)} />
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
            <p className="text-slate-500 font-medium">Nessun dato per il {anno}</p>
            <p className="text-slate-400 text-sm mt-1">Importa il file Excel HubSpot per iniziare</p>
          </div>
        )}

        {!loading && kpi && !isEmpty && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                title="Pipeline Aperta"
                value={eur(kpi.pipeline_aperta_pesata)}
                sub={`Non pesato: ${eur(kpi.pipeline_aperta)}`}
                icon={TrendingUp}
                color="blue"
              />
              <StatCard
                title="Totale WON"
                value={eur(kpi.totale_won)}
                sub={`${kpi.per_fase.find(f => f.label === 'WON')?.count ?? 0} trattative vinte`}
                icon={Trophy}
                color="emerald"
              />
              <StatCard
                title="Win Rate"
                value={`${kpi.win_rate.toFixed(1)}%`}
                sub={`${kpi.per_fase.find(f => f.label === 'WON')?.count ?? 0} vinte su ${kpi.per_fase.filter(f => f.label === 'WON' || f.label.toUpperCase().includes('LOST')).reduce((s, f) => s + f.count, 0)} chiuse`}
                icon={Target}
                color="amber"
              />
              <StatCard
                title="Totale Trattative"
                value={kpi.totale_trattative.toLocaleString('it-IT')}
                sub={`Attive: ${kpi.per_fase.filter(f => f.label !== 'WON' && !f.label.toUpperCase().includes('LOST')).reduce((s, f) => s + f.count, 0)}`}
                icon={BarChart2}
                color="rose"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <BarChart data={perBuFiltered} title="Importo — Digital Platform" mode="dual" hideXLabels />
              <BarChart data={kpi.per_fase} title="Trattative per Fase" mode="count" />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <BarChart data={kpi.top_owners} title="Top Proprietari per Importo" mode="dual" horizontal height={340} />
              <BarChart data={kpi.per_anno} title="Pipeline per Anno di Competenza" mode="dual" />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
