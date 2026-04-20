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
}

interface Props {
  deals: Deal[]
}

function eur(v: number) {
  return '€' + v.toLocaleString('it-IT', { maximumFractionDigits: 0 })
}

function faseColor(fase: string): 'default' | 'secondary' | 'outline' {
  if (fase === 'Committed' || fase === 'Negotiation') return 'default'
  if (fase === 'Proposing') return 'secondary'
  return 'outline'
}

export function TopDealsTable({ deals }: Props) {
  if (!deals.length) {
    return (
      <div className="rounded-xl bg-white border border-slate-100 p-12 text-center text-slate-400 text-sm shadow-sm">
        Nessuna trattativa aperta per il periodo selezionato.
      </div>
    )
  }

  return (
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
              <TableCell className="text-xs text-slate-500 text-right whitespace-nowrap">
                {d.data_chiusura ? new Date(d.data_chiusura).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
