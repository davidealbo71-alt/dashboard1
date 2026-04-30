'use client'

import { ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface NonSolideDeal {
  nome_trattativa: string
  azienda_associata: string
  importo: number
  importo_previsto: number
  fase_trattativa: string
  proprietario: string
  data_chiusura: string | null
  data_creazione: string | null
  probabilita: number
  margine: number | null
}

interface Props { deals: NonSolideDeal[] }

function eur(v: number) {
  return '€' + v.toLocaleString('it-IT', { maximumFractionDigits: 0 })
}

function margineColor(m: number | null) {
  if (m == null) return 'text-slate-400'
  if (m >= 40) return 'text-emerald-600 font-semibold'
  if (m >= 20) return 'text-amber-600'
  return 'text-rose-600'
}

function faseColor(fase: string) {
  const f = fase?.toLowerCase() ?? ''
  if (f.includes('proposal')) return 'border-violet-400 text-violet-700 bg-violet-50'
  if (f.includes('discovery') || f.includes('qualification')) return 'border-amber-400 text-amber-700 bg-amber-50'
  if (f.includes('presentation')) return 'border-sky-400 text-sky-700 bg-sky-50'
  return 'border-slate-300 text-slate-600 bg-slate-50'
}

export function NonSolideTab({ deals }: Props) {
  const totaleImporto = deals.reduce((s, d) => s + (d.importo || 0), 0)
  const totalePesato = deals.reduce((s, d) => s + (d.importo_previsto || 0), 0)

  const faseCounts = deals.reduce<Record<string, { count: number; importo: number }>>((acc, d) => {
    const fase = d.fase_trattativa || 'Sconosciuta'
    if (!acc[fase]) acc[fase] = { count: 0, importo: 0 }
    acc[fase].count++
    acc[fase].importo += d.importo || 0
    return acc
  }, {})

  const topFasi = Object.entries(faseCounts)
    .sort((a, b) => b[1].importo - a[1].importo)
    .slice(0, 3)

  if (!deals.length) {
    return (
      <div className="rounded-xl bg-white border border-slate-100 p-12 text-center text-slate-400 text-sm shadow-sm">
        <ShieldAlert className="mx-auto h-8 w-8 text-slate-300 mb-2" />
        Nessuna trattativa non solida nel periodo selezionato.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Spiegazione */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 space-y-1">
        <p><span className="font-semibold">Cosa sono le Trattative Non Solide?</span> Sono le opportunità aperte che <span className="font-semibold">non si trovano</span> nelle fasi <span className="font-semibold">Committed</span> e <span className="font-semibold">Negotiation</span> — deal ancora in fasi preliminari (Discovery, Qualification, Proposal, ecc.).</p>
        <p>Rappresentano il <span className="font-semibold">potenziale futuro</span> della pipeline, con una probabilità di chiusura più bassa rispetto alle trattative solide.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trattative Non Solide</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{deals.length}</p>
          <p className="mt-1 text-xs text-slate-400">Escluse Committed + Negotiation</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-amber-400">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Importo Totale</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{eur(totalePesato)}</p>
          <p className="mt-1 text-xs text-slate-400">Non pesato: {eur(totaleImporto)}</p>
        </div>
        {topFasi[0] && (
          <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-violet-400">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">{topFasi[0][0]}</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">{topFasi[0][1].count}</p>
            <p className="mt-1 text-xs text-slate-400">{eur(topFasi[0][1].importo)}</p>
          </div>
        )}
        {topFasi[1] && (
          <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-sky-400">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">{topFasi[1][0]}</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">{topFasi[1][1].count}</p>
            <p className="mt-1 text-xs text-slate-400">{eur(topFasi[1][1].importo)}</p>
          </div>
        )}
      </div>

      {/* Tabella */}
      <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-semibold text-slate-700">Dettaglio Trattative Non Solide</h2>
          <span className="ml-auto text-xs text-slate-400">Ordinate per data chiusura (più vicina)</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs">Trattativa</TableHead>
              <TableHead className="text-xs">Azienda</TableHead>
              <TableHead className="text-xs">Fase</TableHead>
              <TableHead className="text-xs">Sales</TableHead>
              <TableHead className="text-xs text-right">Data Apertura</TableHead>
              <TableHead className="text-xs text-right">Importo</TableHead>
              <TableHead className="text-xs text-right">Pesato</TableHead>
              <TableHead className="text-xs text-right">Prob. %</TableHead>
              <TableHead className="text-xs text-right">Margine %</TableHead>
              <TableHead className="text-xs text-right">Chiusura Prev.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((d, i) => (
              <TableRow key={i} className="hover:bg-slate-50">
                <TableCell className="text-xs font-medium text-slate-700 max-w-[180px] truncate">{d.nome_trattativa || '—'}</TableCell>
                <TableCell className="text-xs text-slate-600 max-w-[140px] truncate">{d.azienda_associata || '—'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs whitespace-nowrap ${faseColor(d.fase_trattativa)}`}>{d.fase_trattativa || '—'}</Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-600 whitespace-nowrap">{d.proprietario || '—'}</TableCell>
                <TableCell className="text-xs text-slate-500 text-right whitespace-nowrap">
                  {d.data_creazione ? new Date(d.data_creazione).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </TableCell>
                <TableCell className="text-xs font-semibold text-slate-700 text-right whitespace-nowrap">{eur(d.importo)}</TableCell>
                <TableCell className="text-xs text-slate-500 text-right whitespace-nowrap">{eur(d.importo_previsto)}</TableCell>
                <TableCell className="text-xs text-right whitespace-nowrap text-slate-600">{d.probabilita ?? '—'}</TableCell>
                <TableCell className={`text-xs text-right whitespace-nowrap ${margineColor(d.margine)}`}>
                  {d.margine != null ? d.margine.toFixed(1) + '%' : '—'}
                </TableCell>
                <TableCell className="text-xs text-slate-500 text-right whitespace-nowrap">
                  {d.data_chiusura ? new Date(d.data_chiusura).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
