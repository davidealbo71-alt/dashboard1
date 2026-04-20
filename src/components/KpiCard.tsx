'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { KpiRecord } from '@/types/kpi'

interface Props {
  kpi: KpiRecord
}

export function KpiCard({ kpi }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.name}</CardTitle>
          {kpi.category && <Badge variant="secondary">{kpi.category}</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {kpi.value.toLocaleString('it-IT')}
          {kpi.unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{kpi.unit}</span>}
        </div>
        {kpi.date && <p className="mt-1 text-xs text-muted-foreground">{kpi.date}</p>}
      </CardContent>
    </Card>
  )
}
