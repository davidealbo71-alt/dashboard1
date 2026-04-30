'use client'

import { useState } from 'react'
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const PAGE_SIZE = 20

interface WonDeal {
  nome_trattativa: string
  azienda_associata: string
  importo: number
  importo_previsto: number
  fase_trattativa: string
  proprietario: string
  data_chiusura: string | null
  data_creazione: string | null
  probabilita: number
  service_line: string | null
  margine: number | null
}

interface Props { deals: WonDeal[] }

function eur(v: number) {
  return '€' + v.toLocaleString('it-IT', { maximumFractionDigits: 0 })
}

function margineColor(m: number | null) {
  if (m == null) return 'text-slate-400'
  if (m >= 0.30) return 'text-emerald-600 font-semibold'
  if (m >= 0.20) return 'text-amber-600'
  return 'text-rose-600'
}

function topPerSales(deals: WonDeal[]) {
  const map = new Map<string, { count: number; importo: number }>()
  for (const d of deals) {
    const k = d.proprietario || '—'
    const cur = map.get(k) ?? { count: 0, importo: 0 }
    map.set(k, { count: cur.count + 1, importo: cur.importo + (d.importo || 0) })
  }
  return Array.from(map.entries())
    .map(([nome, v]) => ({ nome, ...v }))
    .sort((a, b) => b.importo - a.importo)
}

export function WonTab({ deals }: Props) {
  const [page, setPage] = useState(1)

  const sorted = [...deals].sort((a, b) =>
    (a.nome_trattativa ?? '').localeCompare(b.nome_trattativa ?? '', 'it')
  )
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totaleImporto = deals.reduce((s, d) => s + (d.importo || 0), 0)
  const importoMedio = deals.length ? totaleImporto / deals.length : 0
  const perSales = topPerSales(deals)

  if (!deals.length) {
    return (
      <div className="rounded-xl bg-white border border-slate-100 p-12 text-center text-slate-400 text-sm shadow-sm">
        <Trophy className="mx-auto h-8 w-8 text-slate-300 mb-2" />
        Nessuna trattativa WON nel periodo selezionato.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Spiegazione */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900 space-y-1">
        <p><span className="font-semibold">Trattative WON</span> — opportunità chiuse positivamente nel periodo selezionato. Ordinate per data di chiusura (più recente prima).</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trattative Vinte</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{deals.length}</p>
          <p className="mt-1 text-xs text-slate-400">nel periodo</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-emerald-400">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Importo Totale</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{eur(totaleImporto)}</p>
          <p className="mt-1 text-xs text-slate-400">fatturato acquisito</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-teal-400">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Importo Medio</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{eur(importoMedio)}</p>
          <p className="mt-1 text-xs text-slate-400">per trattativa vinta</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-green-400">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Top Sales</p>
          {perSales.length > 0 ? (
            <>
              <p className="mt-2 text-lg font-bold text-slate-800 truncate">{perSales[0].nome}</p>
              <p className="mt-1 text-xs text-slate-400">{perSales[0].count} vinte · {eur(perSales[0].importo)}</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-400">—</p>
          )}
        </div>
      </div>

      {/* Per sales breakdown */}
      {perSales.length > 1 && (
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-semibold text-slate-700">Risultati per Sales</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {perSales.map((s, i) => (
              <div key={s.nome} className="flex items-center gap-4 px-5 py-3">
                <span className="text-xs font-bold text-slate-400 w-5">{i + 1}</span>
                <span className="text-sm font-medium text-slate-700 flex-1">{s.nome}</span>
                <span className="text-xs text-slate-500">{s.count} vinte</span>
                <span className="text-sm font-semibold text-emerald-700">{eur(s.importo)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabella */}
      <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-emerald-500" />
          <h2 className="text-sm font-semibold text-slate-700">Dettaglio Trattative WON</h2>
          <span className="ml-auto text-xs text-slate-400">Ordinate alfabeticamente · {deals.length} totali</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs">Trattativa</TableHead>
              <TableHead className="text-xs">Azienda</TableHead>
              <TableHead className="text-xs">Sales</TableHead>
              <TableHead className="text-xs">Service Line</TableHead>
              <TableHead className="text-xs text-right">Data Apertura</TableHead>
              <TableHead className="text-xs text-right">Data Chiusura</TableHead>
              <TableHead className="text-xs text-right">Importo</TableHead>
              <TableHead className="text-xs text-right">Margine %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((d, i) => (
              <TableRow key={i} className="hover:bg-emerald-50/40">
                <TableCell className="text-xs font-medium text-slate-700 max-w-[200px] truncate">{d.nome_trattativa || '—'}</TableCell>
                <TableCell className="text-xs text-slate-600 max-w-[140px] truncate">{d.azienda_associata || '—'}</TableCell>
                <TableCell className="text-xs text-slate-600 whitespace-nowrap">{d.proprietario || '—'}</TableCell>
                <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                  {d.service_line ? (
                    <Badge variant="outline" className="text-xs border-slate-200 text-slate-600">{d.service_line}</Badge>
                  ) : '—'}
                </TableCell>
                <TableCell className="text-xs text-slate-500 text-right whitespace-nowrap">
                  {d.data_creazione ? new Date(d.data_creazione).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </TableCell>
                <TableCell className="text-xs font-medium text-emerald-700 text-right whitespace-nowrap">
                  {d.data_chiusura ? new Date(d.data_chiusura).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </TableCell>
                <TableCell className="text-xs font-semibold text-slate-800 text-right whitespace-nowrap">{eur(d.importo)}</TableCell>
                <TableCell className={`text-xs text-right whitespace-nowrap ${margineColor(d.margine)}`}>
                  {d.margine != null ? (d.margine * 100).toFixed(1) + '%' : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Paginazione */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Pagina {page} di {totalPages} · righe {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} di {sorted.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce<(number | '...')[]>((acc, n, idx, arr) => {
                  if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push('...')
                  acc.push(n)
                  return acc
                }, [])
                .map((n, idx) =>
                  n === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-xs text-slate-400">…</span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setPage(n as number)}
                      className={`min-w-[28px] rounded-md px-2 py-1 text-xs font-medium transition-colors ${page === n ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      {n}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
