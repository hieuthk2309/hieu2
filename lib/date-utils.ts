export interface DateOption {
  dateStr: string // YYYY-MM-DD
  dayLabel: string // e.g. "Thứ 2 (17/08)"
  fullLabel: string // e.g. "Thứ Hai, 17/08/2026"
  isToday: boolean
}

export const getVietnameseWeekday = (date: Date): string => {
  const day = date.getDay()
  const weekdays = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
  return weekdays[day]
}

export const formatDateString = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  const dayMonth = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`
  return `${getVietnameseWeekday(d)} (${dayMonth})`
}

/**
 * Returns the next working day (Monday - Friday) starting from tomorrow (or from today if specified).
 * If the next day falls on Saturday or Sunday, skips to Monday.
 */
export const getNextWorkingDay = (fromDate = new Date()): { dateStr: string; label: string } => {
  const d = new Date(fromDate)
  d.setHours(0, 0, 0, 0)
  // Step to next day
  d.setDate(d.getDate() + 1)
  // Skip weekends (0 = Sunday, 6 = Saturday)
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1)
  }

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`
  const dayMonth = `${day}/${month}`
  const label = `${getVietnameseWeekday(d)} (${dayMonth})`

  return { dateStr, label }
}

/**
 * Returns upcoming working days (excluding Saturdays and Sundays).
 */
export const getUpcomingWorkingDays = (count = 7, fromDate = new Date()): DateOption[] => {
  const days: DateOption[] = []
  const current = new Date(fromDate)
  current.setHours(0, 0, 0, 0)

  while (days.length < count) {
    current.setDate(current.getDate() + 1)
    const dayOfWeek = current.getDay()
    // Skip Saturday (6) and Sunday (0)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue
    }

    const year = current.getFullYear()
    const month = String(current.getMonth() + 1).padStart(2, '0')
    const day = String(current.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    const dayMonth = `${day}/${month}`
    const weekdayName = getVietnameseWeekday(current)
    const dayLabel = `${weekdayName} (${dayMonth})`
    const fullLabel = `${weekdayName}, ${dayMonth}/${year}`

    days.push({
      dateStr,
      dayLabel,
      fullLabel,
      isToday: false,
    })
  }

  return days
}
