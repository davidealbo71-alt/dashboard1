'use client'

import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const PALETTE = ['#3b82f6','#10b981','#f59e0b','#6366f1','#ec4899','#06b6d4','#8b5cf6','#f97316','#14b8a6','#84cc16']

interface DataItem {
  label: string
  importo: number
  importo_pesato: number
  count: number
}

interface Props {
  data: DataItem[]
  title: string
  valueKey?: 'importo' | 'importo_pesato' | 'count'
  currency?: boolean
  horizontal?: boolean
  height?: number
}

function fmt(v: number, currency: boolean) {
  if (currency) {
    if (v >= 1_000_000) return '€' + (v / 1_000_000).toFixed(1) + 'M'
    if (v >= 1_000) return '€' + (v / 1_000).toFixed(0) + 'k'
    return '€' + v.toLocaleString('it-IT', { maximumFractionDigits: 0 })
  }
  return v.toLocaleString('it-IT')
}

function fmtFull(v: number, currency: boolean) {
  if (currency) return '€' + v.toLocaleString('it-IT', { maximumFractionDigits: 0 })
  return v.toLocaleString('it-IT')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      <p className="text-slate-600">{fmtFull(payload[0].value, currency)}</p>
    </div>
  )
}

export function BarChart({ data, title, valueKey = 'importo', currency = true, horizontal = false, height = 300 }: Props) {
  if (!data.length) return null

  const chartData = data.map((d) => ({ name: d.label, value: d[valueKey] }))

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
      <h2 className="mb-1 text-sm font-semibold text-slate-700">{title}</h2>
      <p className="mb-4 text-xs text-slate-400">{data.length} elementi</p>
      <ResponsiveContainer width="100%" height={height}>
        <ReBarChart
          data={chartData}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={horizontal
            ? { left: 130, right: 30, top: 4, bottom: 4 }
            : { left: 10, right: 10, top: 4, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          {horizontal ? (
            <>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => fmt(v, currency)} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={125} axisLine={false} tickLine={false} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" angle={-35} textAnchor="end" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} interval={0} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => fmt(v, currency)} axisLine={false} tickLine={false} />
            </>
          )}
          <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="value" radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={48}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  )
}
