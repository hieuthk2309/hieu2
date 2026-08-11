'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ShoppingBag,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ChefHat,
  RefreshCw,
  Search,
  ChevronLeft,
  AlertCircle,
  PackageCheck,
  Calendar,
  Utensils,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react'

interface OrderItemData {
  id: number
  menu_item_name: string
  menu_item_price: number
  quantity: number
  toppings: string
  notes: string | null
  subtotal: number
}

interface OrderData {
  id: number
  customer_name: string
  total: number
  status: string
  created_at: string
}

interface OrderWithItems {
  order: OrderData
  items: OrderItemData[]
}

interface SummaryData {
  totalOrders: number
  totalRevenue: number
  statusCounts: {
    pending: number
    confirmed: number
    preparing: number
    delivering: number
    completed: number
    cancelled: number
  }
  topItems: { name: string; quantity: number; revenue: number }[]
  topToppings: { name: string; count: number }[]
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  pending: {
    label: 'Chờ xử lý',
    color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
    icon: Clock,
  },
  confirmed: {
    label: 'Đã xác nhận',
    color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300',
    icon: PackageCheck,
  },
  preparing: {
    label: 'Đang làm',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300',
    icon: ChefHat,
  },
  delivering: {
    label: 'Đang giao',
    color: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300',
    icon: Truck,
  },
  completed: {
    label: 'Hoàn thành',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300',
    icon: XCircle,
  },
}

const getTodayStr = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getShiftedDateStr = (daysAgo: number) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatSelectedDateText = (dateStr: string) => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  const todayStr = getTodayStr()
  const yesterdayStr = getShiftedDateStr(1)

  let prefix = ''
  if (dateStr === todayStr) {
    prefix = 'Hôm nay - '
  } else if (dateStr === yesterdayStr) {
    prefix = 'Hôm qua - '
  }

  const formatted = date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `${prefix}${formatted}`
}

const ADMIN_PASSWORD = 'hieu123'
const SESSION_KEY = 'admin_auth'

export default function AdminTodayOrdersPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const passwordRef = useRef<HTMLInputElement>(null)

  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr())
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)

  // Check session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(SESSION_KEY)
      if (stored === 'true') setIsAuthenticated(true)
    }
  }, [])

  // Focus input when modal appears
  useEffect(() => {
    if (!isAuthenticated) {
      setTimeout(() => passwordRef.current?.focus(), 100)
    }
  }, [isAuthenticated])

  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setIsAuthenticated(true)
      setAuthError(false)
    } else {
      setAuthError(true)
      setIsShaking(true)
      setPasswordInput('')
      setTimeout(() => setIsShaking(false), 600)
      setTimeout(() => passwordRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  const fetchOrders = useCallback(async (dateToFetch?: string, showRefreshingState = false) => {
    try {
      if (showRefreshingState) setIsRefreshing(true)
      const targetDate = dateToFetch ?? selectedDate
      const res = await fetch(`/api/orders/today?date=${targetDate}`)
      if (!res.ok) throw new Error('Không thể tải dữ liệu đơn hàng')
      const data = await res.json()
      setOrders(data.orders || [])
      setSummary(data.summary || null)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchOrders(selectedDate)
  }, [selectedDate, fetchOrders])

  // Auto refresh every 30s
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      fetchOrders(selectedDate, true)
    }, 30000)
    return () => clearInterval(interval)
  }, [autoRefresh, selectedDate, fetchOrders])

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingOrderId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Cập nhật trạng thái thất bại')

      // Refresh data
      await fetchOrders(selectedDate, true)
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật trạng thái đơn hàng')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const filteredOrders = orders.filter(({ order }) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(order.id).includes(searchQuery)
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        <div
          className="relative z-10 w-full max-w-sm mx-4"
          style={{
            animation: isShaking ? 'shake 0.5s ease-in-out' : 'none',
          }}
        >
          <style>{`
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              15% { transform: translateX(-8px); }
              30% { transform: translateX(8px); }
              45% { transform: translateX(-6px); }
              60% { transform: translateX(6px); }
              75% { transform: translateX(-4px); }
              90% { transform: translateX(4px); }
            }
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(24px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div
            className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl"
            style={{ animation: 'fadeInUp 0.4s ease-out' }}
          >
            {/* Icon */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Khu Vực Quản Lý</h1>
              <p className="text-slate-400 text-sm mt-1.5 text-center">Nhập mật khẩu để truy cập trang quản lý đơn hàng</p>
            </div>

            {/* Password input */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value)
                    if (authError) setAuthError(false)
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập mật khẩu..."
                  className={`w-full px-4 py-3.5 pr-12 rounded-xl text-white placeholder-slate-500 text-sm font-medium outline-none transition-all duration-200 ${
                    authError
                      ? 'bg-rose-950/40 border-2 border-rose-500/70 focus:border-rose-400'
                      : 'bg-slate-800/70 border-2 border-slate-700/60 focus:border-indigo-500/80'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>

              {authError && (
                <p className="text-rose-400 text-xs font-medium flex items-center gap-1.5 px-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
                  Mật khẩu không đúng. Vui lòng thử lại.
                </p>
              )}

              <button
                onClick={handleLogin}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Truy Cập
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Bar */}
        <div className="flex flex-col gap-4 bg-card p-6 rounded-2xl border border-border shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground -ml-2">
                    <ChevronLeft className="w-4 h-4" /> Trang chủ
                  </Button>
                </Link>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Utensils className="w-8 h-8 text-primary" />
                Quản Lý Đơn Hàng
              </h1>
              <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1 capitalize font-medium">
                <Calendar className="w-4 h-4 text-primary" />
                {formatSelectedDateText(selectedDate)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border text-sm">
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
                <label htmlFor="auto-refresh" className="cursor-pointer text-xs font-medium select-none">
                  Tự động làm mới (30s)
                </label>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchOrders(selectedDate, true)}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
            </div>
          </div>

          {/* Date Picker & Quick Select */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Chọn ngày:
              </span>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto h-9 text-xs font-semibold bg-background border-input cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <Button
                variant={selectedDate === getTodayStr() ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSelectedDate(getTodayStr())}
                className="text-xs h-8 px-3 font-medium"
              >
                Hôm nay
              </Button>
              <Button
                variant={selectedDate === getShiftedDateStr(1) ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSelectedDate(getShiftedDateStr(1))}
                className="text-xs h-8 px-3 font-medium"
              >
                Hôm qua
              </Button>
              <Button
                variant={selectedDate === getShiftedDateStr(2) ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSelectedDate(getShiftedDateStr(2))}
                className="text-xs h-8 px-3 font-medium"
              >
                Hôm kia
              </Button>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-emerald-200/60 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                Doanh Thu Ngày {selectedDate === getTodayStr() ? 'Hôm Nay' : selectedDate}
              </CardTitle>
              <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {formatPrice(summary?.totalRevenue || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-blue-200/60 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Tổng Số Đơn Hàng
              </CardTitle>
              <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {summary?.totalOrders || 0} đơn
              </div>
            </CardContent>
          </Card>

          {/* <Card className="border border-amber-200/60 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-200">
                Đơn Cần Xử Lý
              </CardTitle>
              <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <ChefHat className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {(summary?.statusCounts.pending || 0) +
                  (summary?.statusCounts.confirmed || 0) +
                  (summary?.statusCounts.preparing || 0)}{' '}
                đơn
              </div>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">
                Chờ duyệt / đang làm bánh
              </p>
            </CardContent>
          </Card> */}

          {/* <Card className="border border-purple-200/60 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-200">
                Đang Giao / Hoàn Thành
              </CardTitle>
              <div className="w-9 h-9 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {(summary?.statusCounts.delivering || 0) + (summary?.statusCounts.completed || 0)} đơn
              </div>
              <p className="text-xs text-purple-600/80 dark:text-purple-400/80 mt-1">
                Đang giao hoặc đã xong
              </p>
            </CardContent>
          </Card> */}
        </div>

        {/* Filter & Search Bar */}
        <Card className="shadow-xs border-border p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Tìm tên khách hàng hoặc mã đơn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-muted-foreground shrink-0">Lọc đơn:</span>
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className="text-xs h-8"
              >
                Tất cả ({orders.length})
              </Button>

              {Object.entries(STATUS_LABELS).map(([key, item]) => {
                const count = summary?.statusCounts[key as keyof typeof summary.statusCounts] || 0
                return (
                  <Button
                    key={key}
                    variant={statusFilter === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(key)}
                    className="text-xs h-8 shrink-0"
                  >
                    {item.label} ({count})
                  </Button>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Danh Sách Đơn Hàng ({filteredOrders.length})
            </h2>
          </div>

          {isLoading ? (
            <Card className="p-12 text-center text-muted-foreground border-dashed">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 opacity-60" />
              <p className="font-medium">Đang tải danh sách đơn hàng cho ngày {selectedDate}...</p>
            </Card>
          ) : error ? (
            <div className="p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground border-dashed">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <h3 className="font-bold text-foreground text-base mb-1">Không tìm thấy đơn hàng nào</h3>
              <p className="text-sm">
                {searchQuery || statusFilter !== 'all'
                  ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.'
                  : `Chưa có đơn hàng nào trong ngày ${selectedDate}.`}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredOrders.map(({ order, items }) => {
                const currentStatusInfo = STATUS_LABELS[order.status] || {
                  label: order.status,
                  color: 'bg-gray-100 text-gray-800',
                  icon: Clock,
                }
                const StatusIcon = currentStatusInfo.icon

                return (
                  <Card
                    key={order.id}
                    className="shadow-xs border-border hover:border-primary/40 transition-colors overflow-hidden"
                  >
                    <CardHeader className="bg-muted/20 border-b border-border/60 py-3.5 px-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-base font-extrabold bg-primary/10 text-primary px-2.5 py-1 rounded-md">
                            #{order.id}
                          </span>
                          <div>
                            <span className="font-bold text-foreground text-base block sm:inline">
                              {order.customer_name}
                            </span>
                            <span className="text-xs text-muted-foreground ml-0 sm:ml-2">
                              • Giờ đặt: {formatTime(order.created_at)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge className={`px-3 py-1 text-xs border font-medium flex items-center gap-1.5 ${currentStatusInfo.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {currentStatusInfo.label}
                          </Badge>

                          {/* Quick Status Update */}
                          <Select
                            value={order.status}
                            onValueChange={(val) => handleUpdateStatus(order.id, val)}
                            disabled={updatingOrderId === order.id}
                          >
                            <SelectTrigger className="w-[140px] h-8 text-xs font-semibold">
                              <SelectValue placeholder="Đổi trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(STATUS_LABELS).map(([statusKey, statusVal]) => (
                                <SelectItem key={statusKey} value={statusKey} className="text-xs">
                                  {statusVal.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 space-y-4">
                      {/* Item list */}
                      <div className="space-y-2.5">
                        {items.map((item) => {
                          let parsedToppings: string[] = []
                          if (item.toppings) {
                            try {
                              parsedToppings = JSON.parse(item.toppings)
                            } catch {
                              // Ignore
                            }
                          }

                          return (
                            <div
                              key={item.id}
                              className="flex items-start justify-between gap-4 p-3 rounded-lg bg-card border border-border/50 text-sm"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-sm text-xs">
                                    {item.quantity}x
                                  </span>
                                  <span className="font-bold text-foreground">{item.menu_item_name}</span>
                                </div>

                                {parsedToppings.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 pl-6 pt-0.5">
                                    {parsedToppings.map((tp, idx) => (
                                      <span
                                        key={idx}
                                        className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md font-medium"
                                      >
                                        + {tp}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {item.notes && (
                                  <div className="text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 px-2.5 py-1 rounded-md mt-1 inline-flex items-center gap-1.5">
                                    <span className="font-bold">Ghi chú:</span> {item.notes}
                                  </div>
                                )}
                              </div>

                              <span className="font-bold text-foreground text-sm shrink-0">
                                {formatPrice(item.subtotal)}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      <Separator className="my-2" />

                      {/* Total */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-muted-foreground font-medium">Tổng tiền đơn hàng:</span>
                        <span className="text-xl font-extrabold text-primary">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

