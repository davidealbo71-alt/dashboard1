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

const COLORS = ['#6366f1','#8b5cf6','#a78bfa','#c4b5fd','#4f46e5','#7c3aed','#818cf8','#a5b4fc','#ddd6fe','#ede9fe']

interface DataItem {
  label: string
  importo: number
  count: number
}

interface Props {
  data: DataItem[]
  title: string
  valueKey?: 'importo' | 'count'
  currency?: boolean
  horizontal?: boolean
  height?: number
}

function fmt(v: number, currency: boolean) {
  if (currency) return '€' + v.toLocaleString('it-IT', { maximumFractionDigits: 0 })
  return v.toLocaleString('it-IT')
}

export function BarChart({ data, title, valueKey = 'importo', currency = true, horizontal = false, height = 280 }: Props) {
  if (!data.length) return null

  const chartData = data.map((d) => ({ name: d.label, value: d[valueKey] }))

  return (
    <div className="rounded-lg border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      <ResponsiveContainer width="100%" height={height}>
        <ReBarChart
          data={chartData}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={horizontal ? { left: 120, right: 20, top: 4, bottom: 4 } : { left: 10, right: 10, top: 4, bottom: 55 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          {horizontal ? (
            <>
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => fmt(v, currency)} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={115} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => (currency ? '€' + (v / 1000).toFixed(0) + 'k' : v)} />
            </>
          )}
          <Tooltip formatter={(v) => fmt(Number(v), currency)} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  )
}
