'use client'

import { type LucideIcon } from 'lucide-react'

interface Props {
  title: string
  value: string
  sub?: string
  sub2?: string
  icon: LucideIcon
  color: 'blue' | 'emerald' | 'amber' | 'rose'
}

const colorMap = {
  blue:    { bg: 'bg-blue-50',    icon: 'text-blue-600',    border: 'border-l-blue-500',    value: 'text-blue-700' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-l-emerald-500', value: 'text-emerald-700' },
  amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   border: 'border-l-amber-500',   value: 'text-amber-700' },
  rose:    { bg: 'bg-rose-50',    icon: 'text-rose-600',    border: 'border-l-rose-500',    value: 'text-rose-700' },
}

export function StatCard({ title, value, sub, sub2, icon: Icon, color }: Props) {
  const c = colorMap[color]
  return (
    <div className={`rounded-xl border-l-4 bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-150 ${c.border}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className={`mt-2 text-3xl font-bold ${c.value}`}>{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
          {sub2 && <p className="text-xs text-slate-400">{sub2}</p>}
        </div>
        <div className={`rounded-xl p-3 ${c.bg} shrink-0 ml-3`}>
          <Icon className={`h-5 w-5 ${c.icon}`} />
        </div>
      </div>
    </div>
  )
}
