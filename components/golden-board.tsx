'use client'

import { useEffect, useState, useCallback } from 'react'
import { Trophy, Star, RefreshCw, Users, ShoppingBag, CalendarCheck, CalendarClock } from 'lucide-react'

interface CustomerEntry {
  name: string
  orderCount: number
  total: number
  latestAt: string
}

interface BoardData {
  totalConfirmedOrders: number
  totalCustomers: number
  customers: CustomerEntry[]
}

// Medal colors for top 3
const MEDAL_CONFIG = [
  { bg: 'from-amber-400 to-yellow-500', text: 'text-orange-900', badge: '🏆' },
  { bg: 'from-slate-300 to-slate-400', text: 'text-orange-900', badge: '⚔️' },
  { bg: 'from-orange-400 to-amber-600', text: 'text-amber-900', badge: '🥇' },
  { bg: 'from-orange-400 to-amber-600', text: 'text-slate-800', badge: '🥈' },
  { bg: 'from-orange-400 to-amber-600', text: 'text-orange-900', badge: '🥉' },
]

// ── Reusable Board UI ──────────────────────────────────────────────────────────
interface BoardPanelProps {
  title: string
  subtitle: string
  listTitle: string
  emptyText: string
  emptyHint: string
  footerNote: string
  /** gradient classes for the panel header bar, e.g. "from-amber-500 to-yellow-400" */
  headerGradient: string
  /** gradient for the trophy icon background */
  iconGradient: string
  /** gradient for the stat card (orders) */
  statOrderGradient: string
  statOrderBorder: string
  statOrderText: string
  statOrderLabel: string
  /** gradient for the stat card (customers) */
  statCustomerGradient: string
  statCustomerBorder: string
  statCustomerText: string
  data: BoardData | null
  loading: boolean
  lastUpdated: Date | null
  onRefresh: () => void
}

function BoardPanel({
  title, subtitle, listTitle, emptyText, emptyHint, footerNote,
  headerGradient, iconGradient, statOrderGradient, statOrderBorder,
  statOrderText, statOrderLabel, statCustomerGradient, statCustomerBorder,
  statCustomerText, data, loading, lastUpdated, onRefresh,
}: BoardPanelProps) {
  const isEmpty = !data || data.totalConfirmedOrders === 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-lg`}>
              <Trophy className="w-5 h-5 text-white drop-shadow" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 text-base leading-none select-none">✨</span>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-foreground leading-tight">{title}</h2>
            <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
          title="Làm mới"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats row */}
      {data && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className={`bg-gradient-to-br ${statOrderGradient} border ${statOrderBorder} rounded-2xl px-4 py-3 flex items-center gap-3`}>
            <div className="w-9 h-9 rounded-xl bg-white/40 dark:bg-black/20 flex items-center justify-center shrink-0">
              <ShoppingBag className={`w-5 h-5 ${statOrderText}`} />
            </div>
            <div>
              <p className={`text-2xl font-extrabold ${statOrderText} leading-none`}>
                {data.totalConfirmedOrders}
              </p>
              <p className={`text-xs ${statOrderText} opacity-70 font-medium mt-0.5`}>{statOrderLabel}</p>
            </div>
          </div>
          <div className={`bg-gradient-to-br ${statCustomerGradient} border ${statCustomerBorder} rounded-2xl px-4 py-3 flex items-center gap-3`}>
            <div className="w-9 h-9 rounded-xl bg-white/40 dark:bg-black/20 flex items-center justify-center shrink-0">
              <Users className={`w-5 h-5 ${statCustomerText}`} />
            </div>
            <div>
              <p className={`text-2xl font-extrabold ${statCustomerText} leading-none`}>
                {data.totalCustomers}
              </p>
              <p className={`text-xs ${statCustomerText} opacity-70 font-medium mt-0.5`}>Khách đã đặt</p>
            </div>
          </div>
        </div>
      )}

      {/* Board */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Board header bar */}
        <div className={`bg-gradient-to-r ${headerGradient} px-4 py-3 flex items-center gap-2`}>
          <Star className="w-4 h-4 text-white fill-white drop-shadow" />
          <span className="text-sm font-extrabold text-white tracking-wide drop-shadow">{listTitle}</span>
          {lastUpdated && (
            <span className="ml-auto text-xs text-white/70 font-medium">
              {lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center gap-3 text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <p className="text-sm font-medium">Đang tải...</p>
          </div>
        ) : isEmpty ? (
          <div className="py-12 flex flex-col items-center gap-3 text-muted-foreground">
            <div className="text-4xl">🏅</div>
            <p className="text-sm font-semibold text-foreground">{emptyText}</p>
            <p className="text-xs text-center max-w-[200px]">{emptyHint}</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data!.customers.map((customer, index) => {
              const medal = MEDAL_CONFIG[index]
              const isTop3 = index < 5

              return (
                <li
                  key={customer.name}
                  className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${
                    isTop3 ? 'bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20' : 'hover:bg-muted/40'
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 shrink-0 text-center">
                    {isTop3 ? (
                      <span className="text-xl leading-none">{medal.badge}</span>
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 shadow-sm ${
                    isTop3
                      ? `bg-gradient-to-br ${medal.bg} ${medal.text}`
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {customer.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isTop3 ? 'text-foreground' : 'text-foreground/80'}`}>
                      {customer.name}
                    </p>
                  </div>

                  {/* Badge nếu nhiều đơn */}
                  {customer.orderCount > 1 && (
                    <span className="shrink-0 inline-flex items-center bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                      ×{customer.orderCount}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-muted-foreground mt-3 font-medium">{footerNote}</p>
    </div>
  )
}

// ── Main exported component ────────────────────────────────────────────────────
export function GoldenBoard() {
  const [todayData, setTodayData] = useState<BoardData | null>(null)
  const [tomorrowData, setTomorrowData] = useState<BoardData | null>(null)
  const [todayLoading, setTodayLoading] = useState(true)
  const [tomorrowLoading, setTomorrowLoading] = useState(true)
  const [todayUpdated, setTodayUpdated] = useState<Date | null>(null)
  const [tomorrowUpdated, setTomorrowUpdated] = useState<Date | null>(null)

  const fetchToday = useCallback(async () => {
    setTodayLoading(true)
    try {
      const res = await fetch('/api/orders/confirmed-today', { cache: 'no-store' })
      if (!res.ok) throw new Error('Fetch failed')
      setTodayData(await res.json())
      setTodayUpdated(new Date())
    } catch { /* silently fail */ } finally {
      setTodayLoading(false)
    }
  }, [])

  const fetchTomorrow = useCallback(async () => {
    setTomorrowLoading(true)
    try {
      const res = await fetch('/api/orders/confirmed-tomorrow', { cache: 'no-store' })
      if (!res.ok) throw new Error('Fetch failed')
      setTomorrowData(await res.json())
      setTomorrowUpdated(new Date())
    } catch { /* silently fail */ } finally {
      setTomorrowLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchToday()
    fetchTomorrow()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className="py-10 px-4 bg-gradient-to-b from-amber-50/60 via-background to-background dark:from-amber-950/20 dark:via-background">
      {/* Section heading */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
          🏆 Bảng Vàng Danh Dự
        </h2>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Vinh danh những khách hàng đã ủng hộ sốp hôm nay và ngày mai
        </p>
      </div>

      {/* ── 2 bảng ngang nhau trên PC, xếp dọc trên mobile ── */}
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">

          {/* ── Bảng Vàng Hôm Nay ── */}
          <BoardPanel
            title="Bảng Vàng Hôm Nay"
            subtitle="Đơn hàng đã hoàn thành trong ngày"
            listTitle="Danh Sách Vinh Danh"
            emptyText="Chưa có đơn hoàn thành hôm nay"
            emptyHint="Hãy là người đầu tiên hoàn thành đơn hôm nay!"
            footerNote="Cảm ơn anh chị em đã ủng hộ sốp ạ hehe"
            headerGradient="from-amber-500 to-yellow-400 dark:from-amber-700 dark:to-yellow-600"
            iconGradient="from-amber-400 to-yellow-500"
            statOrderGradient="from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30"
            statOrderBorder="border-amber-200 dark:border-amber-800/60"
            statOrderText="text-amber-700 dark:text-amber-300"
            statOrderLabel="Đơn hoàn thành"
            statCustomerGradient="from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30"
            statCustomerBorder="border-orange-200 dark:border-orange-800/60"
            statCustomerText="text-orange-700 dark:text-orange-300"
            data={todayData}
            loading={todayLoading}
            lastUpdated={todayUpdated}
            onRefresh={fetchToday}
          />

          {/* ── Bảng Vàng Ngày Mai ── */}
          <BoardPanel
            title="Bảng Vàng Ngày Mai"
            subtitle="Đơn đã xác nhận cho ngày mai"
            listTitle="Danh Sách Đăng Ký"
            emptyText="Chưa có đơn nào cho ngày mai"
            emptyHint="Đặt trước ngay để có suất ngày mai!"
            footerNote="Cảm ơn anh chị em đã ủng hộ sốp ạ hehe"
            headerGradient="from-indigo-500 to-violet-500 dark:from-indigo-700 dark:to-violet-700"
            iconGradient="from-indigo-400 to-violet-500"
            statOrderGradient="from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30"
            statOrderBorder="border-indigo-200 dark:border-indigo-800/60"
            statOrderText="text-indigo-700 dark:text-indigo-300"
            statOrderLabel="Đơn xác nhận"
            statCustomerGradient="from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30"
            statCustomerBorder="border-violet-200 dark:border-violet-800/60"
            statCustomerText="text-violet-700 dark:text-violet-300"
            data={tomorrowData}
            loading={tomorrowLoading}
            lastUpdated={tomorrowUpdated}
            onRefresh={fetchTomorrow}
          />

        </div>
      </div>
    </section>
  )
}
