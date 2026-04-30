'use client'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Deal {
  nome_trattativa: string
  azienda_associata: string
  importo: number
  importo_previsto: number
  fase_trattativa: string
  proprietario: string
  data_chiusura: string | null
  probabilita: number
  margine: number | null
}

interface Props {
  deals: Deal[]
}

function eur(v: number) {
  return '€' + v.toLocaleString('it-IT', { maximumFractionDigits: 0 })
}

function margineColor(m: number | null) {
  if (m == null) return 'text-slate-400'
  if (m >= 0.30) return 'text-emerald-600 font-semibold'
  if (m >= 0.20) return 'text-amber-600'
  return 'text-rose-600'
}

function faseColor(fase: string): 'default' | 'secondary' | 'outline' {
  if (fase === 'Committed' || fase === 'Negotiation') return 'default'
  if (fase === 'Proposing') return 'secondary'
  return 'outline'
}

export function TopDealsTable({ deals }: Props) {
  const totaleImporto = deals.reduce((s, d) => s + (d.importo || 0), 0)
  const totalePesato = deals.reduce((s, d) => s + (d.importo_previsto || 0), 0)

  if (!deals.length) {
    return (
      <div className="rounded-xl bg-white border border-slate-100 p-12 text-center text-slate-400 text-sm shadow-sm">
        Nessuna trattativa aperta per il periodo selezionato.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-white border-l-4 border-l-blue-500 border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Importo Totale (non pesato)</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">{eur(totaleImporto)}</p>
          <p className="mt-1 text-xs text-slate-400">somma delle top {deals.length} opportunità</p>
        </div>
        <div className="rounded-xl bg-white border-l-4 border-l-emerald-500 border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Importo Pesato</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{eur(totalePesato)}</p>
          <p className="mt-1 text-xs text-slate-400">per probabilità di chiusura</p>
        </div>
      </div>

    <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700">Top 10 Opportunità Aperte</h2>
        <p className="text-xs text-slate-400 mt-0.5">Ordinate per importo decrescente · escluse WON e LOST</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="w-8 text-xs">#</TableHead>
            <TableHead className="text-xs">Trattativa</TableHead>
            <TableHead className="text-xs">Azienda</TableHead>
            <TableHead className="text-xs">Fase</TableHead>
            <TableHead className="text-xs">Sales</TableHead>
            <TableHead className="text-xs text-right">Importo</TableHead>
            <TableHead className="text-xs text-right">Pesato</TableHead>
            <TableHead className="text-xs text-right">Prob.</TableHead>
            <TableHead className="text-xs text-right">Margine %</TableHead>
            <TableHead className="text-xs text-right">Chiusura</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deals.map((d, i) => (
            <TableRow key={i} className="hover:bg-slate-50">
              <TableCell className="text-xs font-medium text-slate-400">{i + 1}</TableCell>
              <TableCell className="text-xs font-medium text-slate-700 max-w-[200px] truncate">{d.nome_trattativa || '—'}</TableCell>
              <TableCell className="text-xs text-slate-600 max-w-[160px] truncate">{d.azienda_associata || '—'}</TableCell>
              <TableCell>
                <Badge variant={faseColor(d.fase_trattativa)} className="text-xs whitespace-nowrap">
                  {d.fase_trattativa || '—'}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-slate-600 whitespace-nowrap">{d.proprietario || '—'}</TableCell>
              <TableCell className="text-xs font-semibold text-slate-700 text-right whitespace-nowrap">{eur(d.importo)}</TableCell>
              <TableCell className="text-xs text-slate-500 text-right whitespace-nowrap">{eur(d.importo_previsto)}</TableCell>
              <TableCell className="text-xs text-right">
                <span className={`font-medium ${d.probabilita >= 0.7 ? 'text-emerald-600' : d.probabilita >= 0.4 ? 'text-amber-600' : 'text-slate-500'}`}>
                  {(d.probabilita * 100).toFixed(0)}%
                </span>
              </TableCell>
              <TableCell className={`text-xs text-right whitespace-nowrap ${margineColor(d.margine)}`}>
                {d.margine != null ? (d.margine * 100).toFixed(1) + '%' : '—'}
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
