'use client'

import { ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface SolideDeal {
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

interface Props { deals: SolideDeal[] }

function eur(v: number) {
  return '€' + v.toLocaleString('it-IT', { maximumFractionDigits: 0 })
}

function margineColor(m: number | null) {
  if (m == null) return 'text-slate-400'
  if (m >= 0.30) return 'text-emerald-600 font-semibold'
  if (m >= 0.20) return 'text-amber-600'
  return 'text-rose-600'
}

function faseColor(fase: string) {
  if (fase?.toLowerCase().includes('negotiation')) return 'border-emerald-400 text-emerald-700 bg-emerald-50'
  if (fase?.toLowerCase().includes('committed')) return 'border-blue-400 text-blue-700 bg-blue-50'
  return ''
}

export function SolideTab({ deals }: Props) {
  const totaleImporto = deals.reduce((s, d) => s + (d.importo || 0), 0)
  const totalePesato = deals.reduce((s, d) => s + (d.importo_previsto || 0), 0)
  const negotiation = deals.filter(d => d.fase_trattativa?.toLowerCase().includes('negotiation'))
  const committed = deals.filter(d => d.fase_trattativa?.toLowerCase().includes('committed'))

  if (!deals.length) {
    return (
      <div className="rounded-xl bg-white border border-slate-100 p-12 text-center text-slate-400 text-sm shadow-sm">
        <ShieldCheck className="mx-auto h-8 w-8 text-slate-300 mb-2" />
        Nessuna trattativa solida nel periodo selezionato.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Spiegazione */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-900 space-y-1">
        <p><span className="font-semibold">Cosa sono le Trattative Solide?</span> Sono le opportunità nelle fasi <span className="font-semibold">Committed</span> e <span className="font-semibold">Negotiation</span> — quelle con la più alta probabilità di chiudersi positivamente e su cui il team commerciale sta lavorando attivamente.</p>
        <p>Rappresentano il <span className="font-semibold">backlog più affidabile</span> per la previsione dei ricavi a breve termine.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-blue-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trattative Solide</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{deals.length}</p>
          <p className="mt-1 text-xs text-slate-400">Committed + Negotiation</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-blue-400">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Importo Totale</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{eur(totalePesato)}</p>
          <p className="mt-1 text-xs text-slate-400">Non pesato: {eur(totaleImporto)}</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-emerald-400">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">In Negotiation</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{negotiation.length}</p>
          <p className="mt-1 text-xs text-slate-400">{eur(negotiation.reduce((s, d) => s + (d.importo || 0), 0))}</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-sky-400">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">In Committed</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{committed.length}</p>
          <p className="mt-1 text-xs text-slate-400">{eur(committed.reduce((s, d) => s + (d.importo || 0), 0))}</p>
        </div>
      </div>

      {/* Tabella */}
      <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-500" />
          <h2 className="text-sm font-semibold text-slate-700">Dettaglio Trattative Solide</h2>
          <span className="ml-auto text-xs text-slate-400">Ordinate per importo (decrescente)</span>
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
