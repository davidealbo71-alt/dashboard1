'use client'

import { useCallback, useEffect, useState } from 'react'
import { TrendingUp, Trophy, Target, BarChart2, Calendar, User, ShieldCheck, LayoutDashboard, ListOrdered, TrendingDown, RefreshCw, AlertTriangle, Users, ChevronDown, Layers } from 'lucide-react'
import { MultiSelect } from '@/components/MultiSelect'
import { getAvailableMonths } from '@/lib/dateRange'
import { StatCard } from '@/components/StatCard'
import { BarChart } from '@/components/BarChart'
import { UploadExcel } from '@/components/UploadExcel'
import { TopDealsTable } from '@/components/TopDealsTable'
import { LostDealsTab } from '@/components/LostDealsTab'
import { RecurringTab } from '@/components/RecurringTab'
import { StalloTab } from '@/components/StalloTab'
import { SolideTab } from '@/components/SolideTab'
import { KpiData, LostData, RecurringData } from '@/types/deal'

function eur(v: number) {
  return '€' + v.toLocaleString('it-IT', { maximumFractionDigits: 0 })
}

type Tab = 'dashboard' | 'opportunita' | 'persi' | 'ricorrenti' | 'stallo' | 'solide'

interface StalloDeal {
  nome_trattativa: string; azienda_associata: string; importo: number
  importo_previsto: number; fase_trattativa: string; proprietario: string
  data_chiusura: string | null; data_entrata_fase: string | null; data_creazione: string | null
  probabilita: number; giorni_in_fase: number
}

interface TopDeal {
  nome_trattativa: string; azienda_associata: string; importo: number
  importo_previsto: number; fase_trattativa: string; proprietario: string
  data_chiusura: string | null; probabilita: number
}

export default function HomePage() {
  const [kpi, setKpi] = useState<KpiData | null>(null)
  const [topDeals, setTopDeals] = useState<TopDeal[]>([])
  const [lostData, setLostData] = useState<LostData | null>(null)
  const [recurringData, setRecurringData] = useState<RecurringData | null>(null)
  const [stalloDeals, setStalloDeals] = useState<StalloDeal[]>([])
  const [solideDeals, setSolideDeals] = useState<StalloDeal[]>([])
  const [importDate, setImportDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [anno, setAnno] = useState(2026)
  const [mese, setMese] = useState('')
  const [sales, setSales] = useState('')
  const [serviceLines, setServiceLines] = useState<string[]>([])
  const [tab, setTab] = useState<Tab>('dashboard')

  const buildParams = useCallback((year: number, proprietario: string) => {
    const p = new URLSearchParams({ year: String(year) })
    if (mese) p.set('month', mese)
    if (proprietario) p.set('proprietario', proprietario)
    if (serviceLines.length > 0) p.set('service_line', serviceLines.join(','))
    return p.toString()
  }, [mese, serviceLines])

  const fetchAll = useCallback(async (year: number, proprietario: string) => {
    setLoading(true)
    const qs = buildParams(year, proprietario)
    const [kpiRes, dealsRes, lostRes, recRes, stalloRes, solideRes, metaRes] = await Promise.all([
      fetch(`/api/kpis?${qs}`),
      fetch(`/api/top-deals?${qs}`),
      fetch(`/api/lost-deals?${qs}`),
      fetch(`/api/recurring?${qs}`),
      fetch(`/api/stallo?${qs}`),
      fetch(`/api/solide?${qs}`),
      fetch(`/api/metadata`),
    ])
    const [kpiData, dealsData, lostD, recD, stalloD, solideD, metaD] = await Promise.all([
      kpiRes.json(), dealsRes.json(), lostRes.json(), recRes.json(), stalloRes.json(), solideRes.json(), metaRes.json()
    ])
    setKpi(kpiData.error ? null : kpiData)
    setTopDeals(Array.isArray(dealsData) ? dealsData : [])
    setLostData(lostD.error ? null : lostD)
    setRecurringData(recD.error ? null : recD)
    setStalloDeals(Array.isArray(stalloD) ? stalloD : [])
    setSolideDeals(Array.isArray(solideD) ? solideD : [])
    setImportDate(metaD?.last_import_date ?? null)
    setLoading(false)
  }, [buildParams])

  useEffect(() => { fetchAll(anno, sales) }, [fetchAll, anno, mese, sales, serviceLines])

  const isEmpty = !kpi || kpi.totale_trattative === 0
  const perBuFiltered = kpi?.per_business_unit.filter(b => b.label === 'Digital Platform') ?? []
  const showTopOwners = !sales

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard',   label: 'Dashboard',        icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'opportunita', label: 'Top Opportunità',   icon: <ListOrdered className="h-4 w-4" /> },
    { id: 'persi',       label: 'Analisi Persi',     icon: <TrendingDown className="h-4 w-4" /> },
    { id: 'ricorrenti',  label: 'Ricavi Ricorrenti', icon: <RefreshCw className="h-4 w-4" /> },
    { id: 'stallo',      label: 'A Rischio Stallo',  icon: <AlertTriangle className="h-4 w-4" /> },
    { id: 'solide',      label: 'Trattative Solide', icon: <ShieldCheck className="h-4 w-4" /> },
  ]

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
              <p className="text-xs text-slate-400">
                HubSpot CRM · {importDate ? `Dati al ${new Date(importDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}` : 'Dati aggiornati'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <Layers className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Service Line</span>
              <MultiSelect
                options={kpi?.service_line_disponibili ?? []}
                selected={serviceLines}
                onChange={setServiceLines}
                allLabel="Tutte"
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <User className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Sales</span>
              <select value={sales} onChange={e => setSales(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer max-w-[160px]">
                <option value="">Tutti</option>
                {(kpi?.proprietari_disponibili ?? []).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Anno</span>
              <select value={anno} onChange={e => { setAnno(Number(e.target.value)); setMese(''); setSales('') }}
                className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer">
                {(kpi?.anni_disponibili ?? [anno]).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <ChevronDown className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Mese</span>
              <select value={mese} onChange={e => setMese(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer">
                <option value="">Tutti</option>
                {getAvailableMonths(anno).map(m => (
                  <option key={m.value} value={String(m.value)}>{m.label}</option>
                ))}
              </select>
            </div>
            <UploadExcel onUploadSuccess={() => fetchAll(anno, sales)} />
          </div>
        </div>
        <div className="mx-auto max-w-7xl mt-3 flex gap-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tab === t.id ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6 space-y-6">
        {sales && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200">
              <User className="h-3 w-3" />{sales}
              <button onClick={() => setSales('')} className="ml-1 text-blue-400 hover:text-blue-600">✕</button>
            </span>
          </div>
        )}

        {loading && <div className="flex items-center justify-center py-24 text-slate-400 text-sm">Caricamento dati...</div>}

        {/* DASHBOARD */}
        {!loading && tab === 'dashboard' && (
          <>
            {isEmpty ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-16 text-center">
                <BarChart2 className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">Nessun dato per il {anno}{sales ? ` · ${sales}` : ''}</p>
              </div>
            ) : kpi && (
              <>
                {/* Row 1 KPI — 4 card */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <StatCard title="Pipeline Aperta" value={eur(kpi.pipeline_aperta_pesata)} sub={`Non pesato: ${eur(kpi.pipeline_aperta)}`} icon={TrendingUp} color="blue" />
                  <StatCard title="Totale WON" value={eur(kpi.totale_won)} sub={`${kpi.per_fase.find(f => f.label === 'WON')?.count ?? 0} trattative vinte`} icon={Trophy} color="emerald" />
                  <StatCard title="Win Rate" value={`${kpi.win_rate.toFixed(1)}%`}
                    sub={`${kpi.per_fase.find(f => f.label === 'WON')?.count ?? 0} vinte su ${kpi.per_fase.filter(f => f.label === 'WON' || f.label.toUpperCase().includes('LOST')).reduce((s, f) => s + f.count, 0)} chiuse`}
                    icon={Target} color="amber" />
                  <StatCard title="Importo Medio" value={eur(kpi.importo_medio)} sub="per trattativa aperta" icon={BarChart2} color="rose" />
                </div>

                {/* Row 2 KPI — 3 card */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                  <StatCard title="Trattative Solide" value={eur(kpi.trattative_solide_pesate)} sub={`Non pesato: ${eur(kpi.trattative_solide)}`} sub2={`${kpi.trattative_solide_count} deal (Committed + Negotiation)`} icon={ShieldCheck} color="blue" />
                  <StatCard title="Totale Trattative" value={kpi.totale_trattative.toLocaleString('it-IT')}
                    sub={`Attive: ${kpi.per_fase.filter(f => f.label !== 'WON' && !f.label.toUpperCase().includes('LOST')).reduce((s, f) => s + f.count, 0)}`}
                    icon={Users} color="rose" />
                  <StatCard title="A Rischio Stallo" value={String(kpi.stallo_count)}
                    sub={kpi.stallo_count > 0 ? `${eur(kpi.stallo_importo)} · in fase da >${60}gg` : 'Nessuna trattativa in stallo'}
                    icon={AlertTriangle} color="amber" />
                </div>

                {/* Funnel */}
                {kpi.funnel.length > 0 && (
                  <BarChart data={kpi.funnel} title="Funnel di Conversione" mode="dual" horizontal height={Math.max(200, kpi.funnel.length * 50)} />
                )}

                {/* Charts row */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <BarChart data={perBuFiltered} title="Importo — Digital Platform" mode="dual" hideXLabels />
                  <BarChart data={kpi.per_fase} title="Trattative per Fase" mode="count" />
                </div>

                {/* Charts row 2 */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <BarChart data={kpi.per_cliente} title="Top Clienti per Importo" mode="dual" horizontal height={340} />
                  <BarChart data={kpi.per_service_line} title="Importo per Service Line" mode="dual" horizontal height={340} />
                </div>

                {showTopOwners && (
                  <BarChart data={kpi.top_owners} title="Top Proprietari per Importo" mode="dual" horizontal height={340} />
                )}
              </>
            )}
          </>
        )}

        {/* TOP OPPORTUNITÀ */}
        {!loading && tab === 'opportunita' && <TopDealsTable deals={topDeals} />}

        {/* ANALISI PERSI */}
        {!loading && tab === 'persi' && lostData && <LostDealsTab data={lostData} />}

        {/* RICAVI RICORRENTI */}
        {!loading && tab === 'ricorrenti' && recurringData && <RecurringTab data={recurringData} />}

        {/* A RISCHIO STALLO */}
        {!loading && tab === 'stallo' && <StalloTab deals={stalloDeals} />}

        {/* TRATTATIVE SOLIDE */}
        {!loading && tab === 'solide' && <SolideTab deals={solideDeals} />}
      </main>
    </div>
  )
}
