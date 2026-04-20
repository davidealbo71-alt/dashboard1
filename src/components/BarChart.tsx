'use client'

import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface DataItem {
  label: string
  importo: number
  importo_pesato: number
  count: number
}

interface Props {
  data: DataItem[]
  title: string
  mode?: 'dual' | 'count'
  horizontal?: boolean
  height?: number
}

const COLOR_IMPORTO = '#3b82f6'
const COLOR_PESATO  = '#93c5fd'

function fmtAxis(v: number) {
  if (v >= 1_000_000) return '€' + (v / 1_000_000).toFixed(1) + 'M'
  if (v >= 1_000) return '€' + (v / 1_000).toFixed(0) + 'k'
  return String(v)
}

function fmtFull(v: number) {
  return '€' + v.toLocaleString('it-IT', { maximumFractionDigits: 0 })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs space-y-1">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-medium text-slate-700">
            {p.name === 'Trattative' ? p.value : fmtFull(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function BarChart({ data, title, mode = 'dual', horizontal = false, height = 300 }: Props) {
  if (!data.length) return null

  const chartData = data.map((d) => ({
    name: d.label,
    'Importo': d.importo,
    'Pesato': d.importo_pesato,
    'Trattative': d.count,
  }))

  const tickStyle = { fontSize: 11, fill: '#64748b' }
  const axisStyle = { axisLine: false as const, tickLine: false as const }

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
          barGap={2}
          barCategoryGap="25%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          {horizontal ? (
            <>
              <XAxis type="number" tick={tickStyle} tickFormatter={mode === 'dual' ? fmtAxis : undefined} {...axisStyle} />
              <YAxis type="category" dataKey="name" tick={{ ...tickStyle, fontSize: 11 }} width={125} {...axisStyle} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" angle={-35} textAnchor="end" tick={tickStyle} {...axisStyle} interval={0} />
              <YAxis tick={tickStyle} tickFormatter={mode === 'dual' ? fmtAxis : undefined} {...axisStyle} />
            </>
          )}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: horizontal ? 8 : 0 }} />

          {mode === 'dual' ? (
            <>
              <Bar dataKey="Importo" fill={COLOR_IMPORTO} radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="Pesato"  fill={COLOR_PESATO}  radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={28} />
            </>
          ) : (
            <Bar dataKey="Trattative" fill="#6366f1" radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={36} />
          )}
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  )
}
