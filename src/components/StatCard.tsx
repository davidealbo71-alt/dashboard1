'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  title: string
  value: string
  sub?: string
}

export function StatCard({ title, value, sub }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )
}
