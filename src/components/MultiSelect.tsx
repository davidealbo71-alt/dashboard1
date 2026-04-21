'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface Props {
  options: string[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  allLabel?: string
  getLabel?: (value: string) => string
}

export function MultiSelect({ options, selected, onChange, placeholder = 'Filtra...', allLabel = 'Tutte', getLabel }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggle(value: string) {
    if (selected.includes(value)) onChange(selected.filter(v => v !== value))
    else onChange([...selected, value])
  }

  const label = selected.length === 0
    ? allLabel
    : selected.length === 1
      ? (getLabel ? getLabel(selected[0]) : selected[0])
      : `${selected.length} selezionat${allLabel === 'Tutti' ? 'i' : 'e'}`

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer max-w-[180px]"
      >
        <span className="truncate">{label}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[200px] rounded-lg border border-slate-200 bg-white shadow-lg py-1">
          <button
            onClick={() => onChange([])}
            className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-slate-50 text-slate-700"
          >
            <span>{allLabel}</span>
            {selected.length === 0 && <Check className="h-3.5 w-3.5 text-blue-600" />}
          </button>
          <div className="border-t border-slate-100 mt-1 pt-1">
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => toggle(opt)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-slate-50 text-slate-700 text-left"
              >
                <span className="truncate pr-2">{getLabel ? getLabel(opt) : opt}</span>
                {selected.includes(opt) && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
