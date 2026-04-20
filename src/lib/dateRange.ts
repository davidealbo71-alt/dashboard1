export function getDateRange(year: string, month: string): { from: string; to: string } {
  if (month) {
    const m = parseInt(month)
    const y = parseInt(year)
    const lastDay = new Date(y, m, 0).getDate()
    return {
      from: `${year}-${String(m).padStart(2, '0')}-01`,
      to: `${year}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
    }
  }
  return { from: `${year}-01-01`, to: `${year}-12-31` }
}

export function getAvailableMonths(year: number): { value: number; label: string }[] {
  const MONTHS = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre']
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const startMonth = year === currentYear ? currentMonth : 1
  const endMonth = year <= currentYear ? 12 : 0
  if (endMonth === 0) return []
  return Array.from({ length: endMonth - startMonth + 1 }, (_, i) => ({
    value: startMonth + i,
    label: MONTHS[startMonth + i - 1],
  }))
}
