'use client'

import { type LucideIcon } from 'lucide-react'

interface Props {
  title: string
  value: string
  sub?: string
  icon: LucideIcon
  color: 'blue' | 'emerald' | 'amber' | 'rose'
}

const colorMap = {
  blue:    { bg: 'bg-blue-50',    icon: 'text-blue-600',    border: 'border-l-blue-500' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-l-emerald-500' },
  amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   border: 'border-l-amber-500' },
  rose:    { bg: 'bg-rose-50',    icon: 'text-rose-600',    border: 'border-l-rose-500' },
}

export function StatCard({ title, value, sub, icon: Icon, color }: Props) {
  const c = colorMap[color]
  return (
    <div className={`rounded-xl border-l-4 bg-white p-5 shadow-sm ${c.border}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={`rounded-lg p-2 ${c.bg}`}>
          <Icon className={`h-5 w-5 ${c.icon}`} />
        </div>
      </div>
    </div>
  )
}
