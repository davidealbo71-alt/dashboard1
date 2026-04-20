'use client'

import { BarChart } from '@/components/BarChart'
import { RecurringData } from '@/types/deal'

function eur(v: number) {
  return '€' + v.toLocaleString('it-IT', { maximumFractionDigits: 0 })
}

function pct(a: number, b: number) {
  return b > 0 ? ((a / b) * 100).toFixed(1) + '%' : '—'
}

interface Props { data: RecurringData }

export function RecurringTab({ data }: Props) {
  const totale = data.ricorrente_importo + data.nuovo_importo

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-indigo-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ricorrente</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{eur(data.ricorrente_importo)}</p>
          <p className="mt-1 text-xs text-slate-400">{data.ricorrente_count} deal · {pct(data.ricorrente_importo, totale)} del totale</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-cyan-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nuovo Business</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{eur(data.nuovo_importo)}</p>
          <p className="mt-1 text-xs text-slate-400">{data.nuovo_count} deal · {pct(data.nuovo_importo, totale)} del totale</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-violet-400">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">% Ricorrente</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{pct(data.ricorrente_importo, totale)}</p>
          <p className="mt-1 text-xs text-slate-400">sul totale pipeline</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-slate-300">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Totale Deal</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{data.ricorrente_count + data.nuovo_count}</p>
          <p className="mt-1 text-xs text-slate-400">con tipo trattativa valorizzato</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarChart data={data.per_tipo} title="Importo per Tipo di Trattativa" mode="dual" />
        <BarChart data={data.per_sales} title="Ricavi per Sales (tutti i tipi)" mode="dual" horizontal height={320} />
      </div>
    </div>
  )
}
