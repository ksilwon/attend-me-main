export type TimeFilter = 'today' | 'tomorrow' | 'next_week' | 'past' | 'all'

export function getDateRange(filter: TimeFilter): { dateFrom?: string; dateTo?: string } {
  const now = new Date()
  const todayStr = formatDateISO(now)

  switch (filter) {
    case 'today':
      return { dateFrom: todayStr, dateTo: todayStr }
    case 'tomorrow': {
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return { dateFrom: formatDateISO(tomorrow), dateTo: formatDateISO(tomorrow) }
    }
    case 'next_week': {
      const start = new Date(now)
      start.setDate(start.getDate() + 1)
      const end = new Date(now)
      end.setDate(end.getDate() + 7)
      return { dateFrom: formatDateISO(start), dateTo: formatDateISO(end) }
    }
    case 'past': {
      const pastStart = new Date(2020, 0, 1)
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      return { dateFrom: formatDateISO(pastStart), dateTo: formatDateISO(yesterday) }
    }
    case 'all':
    default:
      return {}
  }
}

export function formatDateISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatDateTime(dateStr: string, timeStr?: string): string {
  try {
    const d = new Date(dateStr)
    const dateFormatted = d.toLocaleDateString('pl-PL', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    if (timeStr) {
      return `${dateFormatted}, ${timeStr.substring(0, 5)}`
    }
    return dateFormatted
  } catch {
    return dateStr
  }
}
