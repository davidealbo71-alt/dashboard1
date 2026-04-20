'use client'

import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface StalloDeal {
  nome_trattativa: string
  azienda_associata: string
  importo: number
  importo_previsto: number
  fase_trattativa: string
  proprietario: string
  data_chiusura: string | null
  data_entrata_fase: string | null
  probabilita: number
  giorni_in_fase: number
}

interface Props { deals: StalloDeal[] }

function eur(v: number) {
  return '€' + v.toLocaleString('it-IT', { maximumFractionDigits: 0 })
}

function giornoColor(g: number) {
  if (g > 180) return 'text-rose-600 font-bold'
  if (g > 90) return 'text-amber-600 font-semibold'
  return 'text-slate-600'
}

export function StalloTab({ deals }: Props) {
  const totaleImporto = deals.reduce((s, d) => s + (d.importo || 0), 0)
  const totalePesato = deals.reduce((s, d) => s + (d.importo_previsto || 0), 0)
  const maxGiorni = deals.length > 0 ? deals[0].giorni_in_fase : 0

  if (!deals.length) {
    return (
      <div className="rounded-xl bg-white border border-slate-100 p-12 text-center text-slate-400 text-sm shadow-sm">
        <AlertTriangle className="mx-auto h-8 w-8 text-slate-300 mb-2" />
        Nessuna trattativa in stallo nel periodo selezionato.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trattative in Stallo</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{deals.length}</p>
          <p className="mt-1 text-xs text-slate-400">ferme da più di 60 giorni</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-amber-400">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Importo Pesato</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{eur(totalePesato)}</p>
          <p className="mt-1 text-xs text-slate-400">Non pesato: {eur(totaleImporto)}</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-rose-400">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Max Giorni in Fase</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{maxGiorni}</p>
          <p className="mt-1 text-xs text-slate-400">trattativa più vecchia</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-slate-300">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Media Giorni in Fase</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">
            {Math.round(deals.reduce((s, d) => s + d.giorni_in_fase, 0) / deals.length)}
          </p>
          <p className="mt-1 text-xs text-slate-400">giorni medi di stallo</p>
        </div>
      </div>

      {/* Tabella */}
      <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-semibold text-slate-700">Dettaglio Trattative in Stallo</h2>
          <span className="ml-auto text-xs text-slate-400">Ordinate per giorni in fase (decrescente)</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs">Trattativa</TableHead>
              <TableHead className="text-xs">Azienda</TableHead>
              <TableHead className="text-xs">Fase</TableHead>
              <TableHead className="text-xs">Sales</TableHead>
              <TableHead className="text-xs text-right">Importo</TableHead>
              <TableHead className="text-xs text-right">Pesato</TableHead>
              <TableHead className="text-xs text-right">Giorni in Fase</TableHead>
              <TableHead className="text-xs text-right">Chiusura Prev.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((d, i) => (
              <TableRow key={i} className="hover:bg-slate-50">
                <TableCell className="text-xs font-medium text-slate-700 max-w-[180px] truncate">{d.nome_trattativa || '—'}</TableCell>
                <TableCell className="text-xs text-slate-600 max-w-[140px] truncate">{d.azienda_associata || '—'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs whitespace-nowrap">{d.fase_trattativa || '—'}</Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-600 whitespace-nowrap">{d.proprietario || '—'}</TableCell>
                <TableCell className="text-xs font-semibold text-slate-700 text-right whitespace-nowrap">{eur(d.importo)}</TableCell>
                <TableCell className="text-xs text-slate-500 text-right whitespace-nowrap">{eur(d.importo_previsto)}</TableCell>
                <TableCell className={`text-xs text-right whitespace-nowrap ${giornoColor(d.giorni_in_fase)}`}>
                  {d.giorni_in_fase} gg
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
