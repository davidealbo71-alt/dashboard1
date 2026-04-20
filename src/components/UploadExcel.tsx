'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  onUploadSuccess: () => void
}

export function UploadExcel({ onUploadSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setMessage('')

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const json = await res.json()

    setLoading(false)

    if (res.ok) {
      setMessage(`✓ ${json.inserted} KPI importati`)
      onUploadSuccess()
    } else {
      setMessage(`Errore: ${json.error}`)
    }

    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex items-center gap-4">
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />
      <Button onClick={() => inputRef.current?.click()} disabled={loading}>
        {loading ? 'Caricamento...' : 'Importa Excel'}
      </Button>
      {message && <span className="text-sm text-muted-foreground">{message}</span>}
    </div>
  )
}
