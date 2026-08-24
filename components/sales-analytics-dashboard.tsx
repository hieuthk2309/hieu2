'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  Utensils,
  Coffee,
  BarChart3,
  LineChart as LineChartIcon,
  RefreshCw,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Sparkles,
  Database,
  Calendar,
} from 'lucide-react'
import {
  formatCurrencyVN,
  formatCompactVN,
  formatNumber,
  type DailyOrderTrend,
  type RevenueDataPoint,
  type TopProduct,
} from '@/data/analytics-mock-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AnalyticsData {
  summary: {
    totalOrders: number
    allOrdersCount: number
    totalRevenue: number
    totalFoodRevenue: number
    totalDrinksRevenue: number
    averageOrderValue: number
  }
  ordersTrend10Days: DailyOrderTrend[]
  revenueWeekly: RevenueDataPoint[]
  revenueMonthly: RevenueDataPoint[]
  topProducts: TopProduct[]
}

export function SalesAnalyticsDashboard() {
  // ── States ──
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [revenuePeriod, setRevenuePeriod] = useState<'weekly' | 'monthly'>('weekly')
  const [revenueChartType, setRevenueChartType] = useState<'line' | 'area'>('line')
  const [trendChartType, setTrendChartType] = useState<'area' | 'line'>('area')
  const [copiedNotification, setCopiedNotification] = useState(false)

  // ── Fetch Real Data from API ──
  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setIsRefreshing(true)
      else setIsLoading(true)

      const res = await fetch('/api/admin/analytics')
      if (!res.ok) {
        throw new Error('Không thể tải dữ liệu thống kê từ hệ thống')
      }
      const json = await res.json()
      setData(json)
      setError(null)
    } catch (err: any) {
      console.error('Fetch analytics error:', err)
      setError(err.message || 'Có lỗi xảy ra khi kết nối máy chủ')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // ── Computations ──
  const summary = data?.summary
  const ordersTrend10Days = data?.ordersTrend10Days || []
  const currentRevenueData = revenuePeriod === 'weekly' ? data?.revenueWeekly || [] : data?.revenueMonthly || []
  const topProducts = data?.topProducts || []

  // Total 10 days orders count
  const total10DaysOrders = useMemo(() => {
    return ordersTrend10Days.reduce((sum, item) => sum + (item.orders || 0), 0)
  }, [ordersTrend10Days])

  const totalFoodOrders10Days = useMemo(() => {
    return ordersTrend10Days.reduce((sum, item) => sum + (item.foodOrders || 0), 0)
  }, [ordersTrend10Days])

  const totalDrinkOrders10Days = useMemo(() => {
    return ordersTrend10Days.reduce((sum, item) => sum + (item.drinkOrders || 0), 0)
  }, [ordersTrend10Days])

  const maxOrderDay = useMemo(() => {
    if (ordersTrend10Days.length === 0) return null
    return ordersTrend10Days.reduce(
      (max, item) => (item.orders > (max?.orders || 0) ? item : max),
      ordersTrend10Days[0]
    )
  }, [ordersTrend10Days])

  const avgOrdersPerDay = useMemo(() => {
    if (ordersTrend10Days.length === 0) return 0
    return Math.round(total10DaysOrders / ordersTrend10Days.length)
  }, [total10DaysOrders, ordersTrend10Days])

  const totalRevenue = summary?.totalRevenue || 0
  const totalFoodRevenue = summary?.totalFoodRevenue || 0
  const totalDrinksRevenue = summary?.totalDrinksRevenue || 0

  const foodRevenuePercent = totalRevenue > 0 ? ((totalFoodRevenue / totalRevenue) * 100).toFixed(1) : '0'
  const drinksRevenuePercent = totalRevenue > 0 ? ((totalDrinksRevenue / totalRevenue) * 100).toFixed(1) : '0'

  // Export report
  const handleExport = () => {
    if (!data) return
    const jsonStr = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        dataSource: 'Supabase Realtime Database',
        summary: data.summary,
        revenuePeriod,
        revenueData: currentRevenueData,
        ordersTrend10Days,
        topProducts,
      },
      null,
      2
    )

    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bao-cao-thong-ke-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setCopiedNotification(true)
    setTimeout(() => setCopiedNotification(false), 3000)
  }

  // ── Custom Tooltips ──
  const CustomRevenueTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: RevenueDataPoint | undefined = payload[0]?.payload
      const foodVal = dataPoint?.foodRevenue || 0
      const drinkVal = dataPoint?.drinksRevenue || 0
      const totalVal = dataPoint?.totalRevenue || foodVal + drinkVal

      return (
        <div className="bg-popover/95 backdrop-blur-md border border-border shadow-xl rounded-xl p-3.5 min-w-[220px] text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5 font-semibold text-foreground">
            <span>{dataPoint?.fullLabel || label}</span>
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary border-primary/20">
              Doanh thu thực
            </Badge>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block shadow-xs" />
                <span>Doanh thu đồ ăn:</span>
              </div>
              <span className="font-semibold text-foreground">{formatCurrencyVN(foodVal)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block shadow-xs" />
                <span>Doanh thu nước:</span>
              </div>
              <span className="font-semibold text-foreground">{formatCurrencyVN(drinkVal)}</span>
            </div>

            <div className="pt-1.5 border-t border-border/60 flex items-center justify-between font-bold text-foreground">
              <span className="text-primary">Tổng cộng:</span>
              <span className="text-primary text-sm">{formatCurrencyVN(totalVal)}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const CustomOrdersTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item: DailyOrderTrend | undefined = payload[0]?.payload
      if (!item) return null

      const isPositive = (item.growthRate ?? 0) >= 0

      return (
        <div className="bg-popover/95 backdrop-blur-md border border-border shadow-xl rounded-xl p-3.5 min-w-[210px] text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
            <div className="font-bold text-foreground flex items-center gap-1.5">
              <span>{item.day}</span>
              <span className="text-muted-foreground font-normal text-[11px]">({item.date})</span>
            </div>
            {item.growthRate !== 0 && (
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  isPositive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                }`}
              >
                {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(item.growthRate ?? 0)}%
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm font-extrabold text-foreground">
              <span>Tổng số đơn:</span>
              <span className="text-indigo-600 dark:text-indigo-400">{formatNumber(item.orders)} đơn</span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                Đơn có đồ ăn:
              </span>
              <span className="font-medium text-foreground">{item.foodOrders} đơn</span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Đơn có nước:
              </span>
              <span className="font-medium text-foreground">{item.drinkOrders} đơn</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto py-8">
        <div className="flex items-center justify-center p-12 bg-card rounded-2xl border border-border">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">Đang tổng hợp dữ liệu thực từ cơ sở dữ liệu...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                  Thống Kê Bán Hàng & Doanh Thu
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Database className="w-3 h-3" />
                  Dữ Liệu Thật (Supabase)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Phân tích dòng tiền từ toàn bộ đơn hàng thực tế đã phát sinh trên hệ thống
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalytics(true)}
            disabled={isRefreshing}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
            <span>Làm mới</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleExport}
            className="gap-1.5 text-xs font-semibold bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
          >
            {copiedNotification ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                <span>Đã xuất file JSON!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Xuất Báo Cáo</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 text-xs font-medium">
          {error}
        </div>
      )}

      {/* ── KPI Summary Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ⭐ THẺ TỔNG QUAN NỔI BẬT: TỔNG SỐ ĐƠN HÀNG (YÊU CẦU CHÍNH) ⭐ */}
        <Card className="relative overflow-hidden border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-card to-amber-500/5 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Chỉ số cốt lõi</span>
              <CardTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                Tổng số đơn hàng
              </CardTitle>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {formatNumber(summary?.totalOrders || 0)}
                <span className="text-base font-semibold text-muted-foreground ml-1.5">đơn</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3.5 h-3.5" />
                Hợp lệ
              </div>
            </div>

            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
              <span>10 ngày gần nhất: {formatNumber(total10DaysOrders)} đơn</span>
              <span className="font-semibold text-foreground">TB ~{avgOrdersPerDay} đơn/ngày</span>
            </div>

            {/* Mini Progress Ratio */}
            {total10DaysOrders > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Đồ ăn: {totalFoodOrders10Days}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Nước: {totalDrinkOrders10Days}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden flex">
                  <div
                    className="bg-amber-500 h-full"
                    style={{ width: `${(totalFoodOrders10Days / total10DaysOrders) * 100}%` }}
                    title="Đồ ăn"
                  />
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: `${(totalDrinkOrders10Days / total10DaysOrders) * 100}%` }}
                    title="Nước"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── KPI 2: TỔNG DOANH THU THỰC TẾ ── */}
        <Card className="bg-card border-border shadow-xs hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Tổng Doanh Thu Thực</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl sm:text-3xl font-bold text-foreground">
              {formatCompactVN(totalRevenue)}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Giá trị đơn TB (AOV):</span>
              <span className="text-primary font-bold">
                {formatCompactVN(summary?.averageOrderValue || 0)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">
              {formatCurrencyVN(totalRevenue)}
            </p>
          </CardContent>
        </Card>

        {/* ── KPI 3: DOANH THU ĐỒ ĂN ── */}
        <Card className="bg-card border-border shadow-xs hover:shadow-md transition-all border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-amber-500" />
              Doanh Thu Đồ Ăn
            </span>
            <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20">
              {foodRevenuePercent}% tổng số
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
              {formatCompactVN(totalFoodRevenue)}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Bánh mì & món ăn kèm</span>
              <span className="font-medium text-foreground">{formatCurrencyVN(totalFoodRevenue)}</span>
            </div>
          </CardContent>
        </Card>

        {/* ── KPI 4: DOANH THU NƯỚC UỐNG ── */}
        <Card className="bg-card border-border shadow-xs hover:shadow-md transition-all border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-blue-500" />
              Doanh Thu Nước
            </span>
            <Badge variant="outline" className="text-[10px] text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20">
              {drinksRevenuePercent}% tổng số
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatCompactVN(totalDrinksRevenue)}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Cà phê & nước giải khát</span>
              <span className="font-medium text-foreground">{formatCurrencyVN(totalDrinksRevenue)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Grid 2 Biểu đồ chính ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ═══════════════════════════════════════════════════════════════
            BIỂU ĐỒ 1: BIỂU ĐỒ DOANH THU (REVENUE LINE / AREA CHART)
        ═══════════════════════════════════════════════════════════════ */}
        <Card className="lg:col-span-7 bg-card border-border shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Biểu Đồ Doanh Thu
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Đường biến động doanh thu Đồ ăn (Màu cam) & Nước uống (Màu xanh dương)
                </CardDescription>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Weekly / Monthly toggle */}
                <div className="flex items-center bg-muted p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setRevenuePeriod('weekly')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      revenuePeriod === 'weekly'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Theo Thứ Trong Tuần
                  </button>
                  <button
                    onClick={() => setRevenuePeriod('monthly')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      revenuePeriod === 'monthly'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Theo 12 Tháng
                  </button>
                </div>

                {/* Line / Area toggle */}
                <div className="flex items-center bg-muted p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setRevenueChartType('line')}
                    title="Biểu đồ đường (Line)"
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      revenueChartType === 'line'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Đường
                  </button>
                  <button
                    onClick={() => setRevenueChartType('area')}
                    title="Biểu đồ miền (Area)"
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      revenueChartType === 'area'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Miền
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            {/* Custom Legend */}
            <div className="flex items-center justify-end gap-5 mb-4 text-xs font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs inline-block" />
                <span className="text-foreground">Doanh thu đồ ăn</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 shadow-xs inline-block" />
                <span className="text-foreground">Doanh thu nước</span>
              </div>
            </div>

            {/* Chart Area */}
            <div className="w-full" style={{ height: 340 }}>
              {currentRevenueData.every((d) => d.foodRevenue === 0 && d.drinksRevenue === 0) ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 opacity-20" />
                  <div className="text-center">
                    <p className="text-sm font-semibold">Chưa có dữ liệu doanh thu</p>
                    <p className="text-xs mt-1 opacity-70">Doanh thu sẽ hiển thị khi có đơn hàng hoàn thành trong hệ thống</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  {revenueChartType === 'line' ? (
                    <LineChart
                      data={currentRevenueData}
                      margin={{ top: 15, right: 15, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
                      <XAxis
                        dataKey="period"
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(128,128,128,0.3)' }}
                        tick={{ fontSize: 11, fill: 'rgba(128,128,128,0.9)' }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => formatCompactVN(val)}
                        tick={{ fontSize: 11, fill: 'rgba(128,128,128,0.9)' }}
                        width={70}
                        domain={[0, 'auto']}
                      />
                      <Tooltip content={<CustomRevenueTooltip />} />
                      <Line
                        type="monotone"
                        name="Doanh thu đồ ăn"
                        dataKey="foodRevenue"
                        stroke="#F97316"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#F97316', strokeWidth: 1 }}
                        activeDot={{ r: 7, fill: '#F97316', stroke: '#fff', strokeWidth: 2 }}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        name="Doanh thu nước"
                        dataKey="drinksRevenue"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#3B82F6', strokeWidth: 1 }}
                        activeDot={{ r: 7, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  ) : (
                    <AreaChart
                      data={currentRevenueData}
                      margin={{ top: 15, right: 15, left: 10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="foodRevGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="drinkRevGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
                      <XAxis
                        dataKey="period"
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(128,128,128,0.3)' }}
                        tick={{ fontSize: 11, fill: 'rgba(128,128,128,0.9)' }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => formatCompactVN(val)}
                        tick={{ fontSize: 11, fill: 'rgba(128,128,128,0.9)' }}
                        width={70}
                        domain={[0, 'auto']}
                      />
                      <Tooltip content={<CustomRevenueTooltip />} />
                      <Area
                        type="monotone"
                        name="Doanh thu đồ ăn"
                        dataKey="foodRevenue"
                        stroke="#F97316"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#foodRevGrad)"
                        activeDot={{ r: 6, fill: '#F97316', stroke: '#fff', strokeWidth: 2 }}
                        isAnimationActive={false}
                      />
                      <Area
                        type="monotone"
                        name="Doanh thu nước"
                        dataKey="drinksRevenue"
                        stroke="#3B82F6"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#drinkRevGrad)"
                        activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>

            {/* Bottom summary note */}
            <div className="mt-3 pt-3 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted-foreground gap-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Số liệu tổng hợp trực tiếp từ tất cả đơn hàng đã hoàn tất</span>
              </div>
              <div className="font-semibold text-foreground">
                Tổng doanh thu: {formatCurrencyVN(totalRevenue)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════════════════════════
            BIỂU ĐỒ 2: XU HƯỚNG ĐƠN HÀNG (ORDERS TREND - 10 NGÀY QUA - YÊU CẦU CHÍNH)
        ═══════════════════════════════════════════════════════════════ */}
        <Card className="lg:col-span-5 bg-card border-border shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5 text-indigo-500" />
                  Xu Hướng Đơn Hàng (10 Ngày)
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Số lượng đơn hàng phát sinh qua 10 ngày gần nhất
                </CardDescription>
              </div>

              {/* Chart type toggle */}
              <div className="flex items-center bg-muted p-1 rounded-lg text-xs">
                <button
                  onClick={() => setTrendChartType('area')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    trendChartType === 'area'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Vùng
                </button>
                <button
                  onClick={() => setTrendChartType('line')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    trendChartType === 'line'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Đường
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            {/* Quick stats badge */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-muted/50 rounded-lg p-2 border border-border/50">
                <div className="text-[11px] text-muted-foreground">Ngày cao nhất:</div>
                <div className="text-sm font-bold text-foreground flex items-center justify-between">
                  <span>{maxOrderDay ? `${maxOrderDay.day} (${maxOrderDay.date})` : 'Chưa có'}</span>
                  <Badge variant="secondary" className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    {maxOrderDay?.orders || 0} đơn
                  </Badge>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2 border border-border/50">
                <div className="text-[11px] text-muted-foreground">Đơn TB / ngày:</div>
                <div className="text-sm font-bold text-foreground flex items-center justify-between">
                  <span>{avgOrdersPerDay} đơn/ngày</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                    <TrendingUp className="w-3 h-3" /> Real
                  </span>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="w-full h-[255px] sm:h-[285px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                {trendChartType === 'area' ? (
                  <AreaChart data={ordersTrend10Days} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="orderTrendGradientReal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(128,128,128,0.3)' }}
                      tick={{ fontSize: 11, fill: 'rgba(128,128,128,0.9)' }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      domain={[0, 'auto']}
                      tick={{ fontSize: 11, fill: 'rgba(128,128,128,0.9)' }}
                      width={32}
                    />
                    <Tooltip content={<CustomOrdersTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stroke="#6366F1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#orderTrendGradientReal)"
                      activeDot={{ r: 6, fill: '#6366F1', stroke: '#fff', strokeWidth: 2 }}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={ordersTrend10Days} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(128,128,128,0.3)' }}
                      tick={{ fontSize: 11, fill: 'rgba(128,128,128,0.9)' }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      domain={[0, 'auto']}
                      tick={{ fontSize: 11, fill: 'rgba(128,128,128,0.9)' }}
                      width={32}
                    />
                    <Tooltip content={<CustomOrdersTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#6366F1"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#6366F1', strokeWidth: 1 }}
                      activeDot={{ r: 7, fill: '#6366F1', stroke: '#fff', strokeWidth: 2 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Bottom 10-days timeline badges */}
            <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                10 ngày trước: {ordersTrend10Days[0]?.date ? `(${ordersTrend10Days[0].date})` : ''}
              </span>
              <span className="font-semibold text-primary">
                Hôm nay: {ordersTrend10Days[ordersTrend10Days.length - 1]?.date ? `(${ordersTrend10Days[ordersTrend10Days.length - 1].date})` : ''}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Bảng phụ trợ: Top Sản Phẩm Bán Chạy & Cơ Cấu Danh Mục ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top selling products */}
        <Card className="lg:col-span-8 bg-card border-border shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Top Món Bán Chạy Nhất (Thực tế)
                </CardTitle>
                <CardDescription className="text-xs">
                  Xếp hạng theo số lượng và doanh thu tích luỹ từ đơn hàng
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {topProducts.length} sản phẩm hàng đầu
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Chưa có dữ liệu món bán ra trong hệ thống.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-muted-foreground uppercase bg-muted/40 border-b border-border/60">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Tên món</th>
                      <th className="py-2.5 px-3 font-semibold">Phân loại</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Đã bán</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {topProducts.map((prod, index) => (
                      <tr key={prod.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-3 font-medium text-foreground flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                            {index + 1}
                          </span>
                          {prod.name}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              prod.category === 'food'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            {prod.category === 'food' ? 'Đồ ăn' : 'Nước uống'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-foreground">
                          {formatNumber(prod.soldQuantity)} phần
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-foreground">
                          {formatCurrencyVN(prod.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tỷ trọng doanh thu theo ngành hàng */}
        <Card className="lg:col-span-4 bg-card border-border shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-foreground">
              Cơ Cấu Doanh Thu Thực
            </CardTitle>
            <CardDescription className="text-xs">
              Tỷ trọng doanh số giữa đồ ăn và nước uống
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Food bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <Utensils className="w-3.5 h-3.5" />
                  Đồ Ăn (Bánh mì)
                </span>
                <span className="text-foreground">{foodRevenuePercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${foodRevenuePercent}%` }}
                />
              </div>
              <div className="text-[11px] text-muted-foreground flex justify-between">
                <span>{formatCurrencyVN(totalFoodRevenue)}</span>
                <span>{totalFoodOrders10Days} đơn gần đây</span>
              </div>
            </div>

            {/* Drinks bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Coffee className="w-3.5 h-3.5" />
                  Nước Uống & Trà
                </span>
                <span className="text-foreground">{drinksRevenuePercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${drinksRevenuePercent}%` }}
                />
              </div>
              <div className="text-[11px] text-muted-foreground flex justify-between">
                <span>{formatCurrencyVN(totalDrinksRevenue)}</span>
                <span>{totalDrinkOrders10Days} đơn gần đây</span>
              </div>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl border border-border/50 text-xs space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Dữ liệu đồng bộ:
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Tất cả các biểu đồ và thống kê được kết nối trực tiếp với Database Supabase theo thời gian thực.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
