// ── Analytics Data Types ──

export interface DailyOrderTrend {
  day: string
  date: string
  orders: number
  foodOrders: number
  drinkOrders: number
  growthRate?: number // % so với ngày trước
}

export interface RevenueDataPoint {
  period: string
  fullLabel: string
  foodRevenue: number
  drinksRevenue: number
  totalRevenue: number
}

export interface TopProduct {
  id: string
  name: string
  category: 'food' | 'drink'
  soldQuantity: number
  revenue: number
  trend: 'up' | 'down'
  growth: number
}

// ── Format Utilities ──

export function formatCurrencyVN(amount: number | string | undefined | null): string {
  const num = Number(amount)
  if (isNaN(num)) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatCompactVN(amount: number | string | undefined | null): string {
  const num = Number(amount)
  if (isNaN(num)) return '0 ₫'
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace('.0', '') + ' Ty'
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace('.0', '') + ' Tr'
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(0) + 'k'
  }
  return num.toLocaleString('vi-VN') + ' d'
}

export function formatNumber(num: number | string | undefined | null): string {
  const n = Number(num)
  if (isNaN(n)) return '0'
  return new Intl.NumberFormat('vi-VN').format(n)
}
