'use client'

import { BarChart } from '@/components/BarChart'
import { LostData } from '@/types/deal'

function eur(v: number) {
  return '€' + v.toLocaleString('it-IT', { maximumFractionDigits: 0 })
}

interface Props { data: LostData }

export function LostDealsTab({ data }: Props) {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-rose-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trattative Perse</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{data.totale_persi}</p>
          <p className="mt-1 text-xs text-slate-400">nel periodo selezionato</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-rose-400">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Importo Perso</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{eur(data.importo_perso)}</p>
          <p className="mt-1 text-xs text-slate-400">valore potenziale non convertito</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-slate-300">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Importo Medio Perso</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">
            {data.totale_persi > 0 ? eur(data.importo_perso / data.totale_persi) : '—'}
          </p>
          <p className="mt-1 text-xs text-slate-400">per trattativa persa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarChart data={data.per_sales} title="Persi per Sales" mode="dual" horizontal height={300} />
        <BarChart data={data.per_cliente} title="Top Clienti Persi" mode="dual" horizontal height={300} />
      </div>

      {data.per_motivo.length > 0 && (
        <BarChart data={data.per_motivo} title="Motivi di Perdita" mode="count" horizontal height={250} />
      )}

      {data.per_motivo.length === 0 && (
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-8 text-center text-slate-400 text-sm">
          Nessun motivo di perdita registrato nel CRM per il periodo selezionato.
        </div>
      )}
    </div>
  )
}
