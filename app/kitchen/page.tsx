'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
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
import { Switch } from '@/components/ui/switch'
import {
  ChefHat,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Clock,
  ChevronLeft,
  Volume2,
  VolumeX,
  Flame,
  Layers,
  ListOrdered,
  Check,
  AlertCircle,
  Calendar,
  PackageCheck,
  Truck,
  XCircle,
  Sparkles,
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

const ADMIN_PASSWORD = 'hieu123'
const SESSION_KEY = 'admin_auth'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: {
    label: 'Chờ xử lý',
    color: 'bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-400/50',
    icon: Clock,
  },
  confirmed: {
    label: 'Đã xác nhận',
    color: 'bg-blue-500/20 text-blue-900 dark:text-blue-200 border-blue-400/50',
    icon: PackageCheck,
  },
  preparing: {
    label: 'Đang làm bánh',
    color: 'bg-indigo-500/20 text-indigo-900 dark:text-indigo-200 border-indigo-400/50 animate-pulse',
    icon: Flame,
  },
  delivering: {
    label: 'Đang giao',
    color: 'bg-purple-500/20 text-purple-900 dark:text-purple-200 border-purple-400/50',
    icon: Truck,
  },
  completed: {
    label: 'Hoàn thành',
    color: 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 border-emerald-400/50',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-rose-500/20 text-rose-900 dark:text-rose-200 border-rose-400/50',
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

export default function KitchenDisplayPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const passwordRef = useRef<HTMLInputElement>(null)

  // Kitchen Display State
  const [viewMode, setViewMode] = useState<'aggregated' | 'tickets'>('aggregated')
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr())
  const [onlyActive, setOnlyActive] = useState(true)
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({})

  const prevOrderCountRef = useRef<number>(0)

  // Auth check on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(SESSION_KEY)
      if (stored === 'true') setIsAuthenticated(true)
    }
  }, [])

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

  // Play audio alert on new orders
  const playSoundAlert = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime) // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15) // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.5)
    } catch {
      // Ignore audio failure
    }
  }

  // Fetch orders logic
  const fetchOrders = useCallback(
    async (showRefreshingState = false) => {
      try {
        if (showRefreshingState) setIsRefreshing(true)
        const res = await fetch(`/api/orders/today?date=${selectedDate}`)
        if (!res.ok) throw new Error('Không thể tải danh sách đơn hàng')
        const data = await res.json()
        const fetchedOrders: OrderWithItems[] = data.orders || []

        // Sound alert check if active orders increased
        if (soundEnabled && fetchedOrders.length > prevOrderCountRef.current && prevOrderCountRef.current > 0) {
          playSoundAlert()
        }
        prevOrderCountRef.current = fetchedOrders.length

        setOrders(fetchedOrders)
        setError(null)
      } catch (err: any) {
        setError(err.message || 'Lỗi kết nối')
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [selectedDate, soundEnabled]
  )

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Auto refresh interval (15s)
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      fetchOrders(true)
    }, 15000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchOrders])

  // Quick status updater for kitchen
  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Cập nhật trạng thái thất bại')
      await fetchOrders(true)
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật trạng thái')
    }
  }

  // Only show 'confirmed' orders in kitchen
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => o.order.status === 'confirmed')
  }, [orders])

  // Aggregate items across orders for Kitchen Aggregated Mode
  const aggregatedDishList = useMemo(() => {
    const map = new Map<
      string,
      {
        dishName: string
        totalQuantity: number
        variationsMap: Map<
          string,
          {
            key: string
            toppings: string[]
            notes: string
            quantity: number
            orderIds: number[]
            customerNames: string[]
          }
        >
      }
    >()

    filteredOrders.forEach(({ order, items }) => {
      items.forEach((item) => {
        const dishName = item.menu_item_name
        if (!map.has(dishName)) {
          map.set(dishName, {
            dishName,
            totalQuantity: 0,
            variationsMap: new Map(),
          })
        }

        const dishData = map.get(dishName)!
        dishData.totalQuantity += item.quantity

        let parsedToppings: string[] = []
        if (item.toppings) {
          try {
            parsedToppings = JSON.parse(item.toppings)
          } catch {}
        }
        const notesStr = (item.notes || '').trim()
        const variationKey = `${dishName}__${parsedToppings.sort().join(',') || 'NONE'}__${notesStr || 'NONE'}`

        if (!dishData.variationsMap.has(variationKey)) {
          dishData.variationsMap.set(variationKey, {
            key: variationKey,
            toppings: parsedToppings,
            notes: notesStr,
            quantity: 0,
            orderIds: [],
            customerNames: [],
          })
        }

        const variation = dishData.variationsMap.get(variationKey)!
        variation.quantity += item.quantity
        if (!variation.orderIds.includes(order.id)) variation.orderIds.push(order.id)
        if (!variation.customerNames.includes(order.customer_name)) variation.customerNames.push(order.customer_name)
      })
    })

    return Array.from(map.values()).map((dish) => ({
      dishName: dish.dishName,
      totalQuantity: dish.totalQuantity,
      variations: Array.from(dish.variationsMap.values()),
    }))
  }, [filteredOrders])

  const toggleItemDone = (key: string) => {
    setCompletedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  // Password Protection Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>

        <div
          className="relative z-10 w-full max-w-sm mx-4"
          style={{ animation: isShaking ? 'shake 0.5s ease-in-out' : 'none' }}
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
          `}</style>

          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-3">
                <ChefHat className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-2xl font-black text-white">Màn Hình Đầu Bếp</h1>
              <p className="text-slate-400 text-xs mt-1">Nhập mật khẩu quản lý để truy cập màn hình chế biến món ăn</p>
            </div>

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
                  className={`w-full px-4 py-3.5 pr-12 rounded-xl text-white placeholder-slate-500 text-sm font-medium outline-none transition-all ${
                    authError
                      ? 'bg-rose-950/40 border-2 border-rose-500/70'
                      : 'bg-slate-800/70 border-2 border-slate-700/60 focus:border-amber-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authError && (
                <p className="text-rose-400 text-xs font-medium flex items-center gap-1 px-1">
                  Mật khẩu không chính xác. Thử lại.
                </p>
              )}

              <button
                onClick={handleLogin}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Vào Màn Hình Bếp
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6 space-y-6">
      {/* Kitchen Navigation Bar */}
      <header className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white -ml-2 gap-1">
                <ChevronLeft className="w-4 h-4" /> Admin
              </Button>
            </Link>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shrink-0">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Màn Hình Đầu Bếp 👨‍🍳
                <Sparkles className="w-5 h-5 text-amber-400 animate-bounce" />
              </h1>
              <p className="text-xs text-slate-400">Giao diện chế biến món &amp; quản lý đơn hàng tốc độ</p>
            </div>
          </div>

          {/* Utility Tools */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700">
              <Button
                variant={viewMode === 'aggregated' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('aggregated')}
                className={`gap-1.5 text-xs font-bold ${
                  viewMode === 'aggregated' ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'text-slate-300'
                }`}
              >
                <Layers className="w-4 h-4" />
                Gộp Món ({aggregatedDishList.reduce((s, d) => s + d.totalQuantity, 0)})
              </Button>

              <Button
                variant={viewMode === 'tickets' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('tickets')}
                className={`gap-1.5 text-xs font-bold ${
                  viewMode === 'tickets' ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'text-slate-300'
                }`}
              >
                <ListOrdered className="w-4 h-4" />
                Theo Đơn ({filteredOrders.length})
              </Button>
            </div>

            {/* Sound alert toggle */}
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs gap-1.5"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              {soundEnabled ? 'Chuông: Mở' : 'Chuông: Tắt'}
            </Button> */}

            {/* Auto refresh toggle */}
            {/* <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
              <Switch id="kitchen-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              <label htmlFor="kitchen-refresh" className="cursor-pointer text-slate-300 font-semibold select-none">
                Tự động (15s)
              </label>
            </div> */}

            {/* Manual Refresh */}
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => fetchOrders(true)}
              disabled={isRefreshing}
              className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Làm mới
            </Button> */}
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-700/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> Ngày:
            </span>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-8 w-auto text-xs bg-slate-900 border-slate-700 text-slate-200 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold text-xs px-3 py-1 rounded-lg">
              ✅ Chỉ hiển thị đơn đã xác nhận ({filteredOrders.length}/{orders.length} đơn)
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 border border-slate-800 rounded-2xl bg-slate-900/50">
          <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-3 text-amber-500" />
          <p className="font-bold text-base">Đang tải danh sách món ăn cho Bếp...</p>
        </div>
      ) : error ? (
        <div className="p-5 bg-rose-950/40 text-rose-300 border border-rose-800 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <span>{error}</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-16 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-30 text-amber-400" />
          <h3 className="font-bold text-lg text-white mb-1">Không có đơn hàng đã xác nhận</h3>
          <p className="text-xs">
            Chưa có đơn nào ở trạng thái &quot;Đã xác nhận&quot; trong ngày {selectedDate}.
          </p>
        </div>
      ) : viewMode === 'aggregated' ? (
        /* ================= MODE 1: AGGREGATED DISHES VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {aggregatedDishList.map((dish) => (
            <Card
              key={dish.dishName}
              className="bg-slate-800/90 border-slate-700/80 shadow-xl overflow-hidden flex flex-col justify-between"
            >
              <CardHeader className="bg-slate-900/80 border-b border-slate-700/80 py-4 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-400 shrink-0" />
                    {dish.dishName}
                  </CardTitle>
                  <Badge className="bg-amber-500 text-slate-950 text-base font-black px-3 py-1 rounded-xl shadow-md">
                    Tổng: {dish.totalQuantity}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4 flex-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Chi tiết yêu cầu &amp; Ghi chú:
                </div>

                <div className="space-y-3">
                  {dish.variations.map((v) => {
                    const isDone = completedItems[v.key]
                    return (
                      <div
                        key={v.key}
                        onClick={() => toggleItemDone(v.key)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isDone
                            ? 'bg-slate-900/40 border-slate-800 opacity-50 line-through'
                            : 'bg-slate-900/90 border-slate-700 hover:border-amber-500/50 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1">
                            {/* Quantity badge */}
                            <div className="flex items-center gap-2">
                              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black px-2.5 py-0.5 rounded-lg text-sm">
                                {v.quantity}x
                              </span>
                              <span className="text-xs font-semibold text-slate-300">
                                Đơn: {v.customerNames.join(', ')}
                              </span>
                            </div>

                            {/* Toppings list */}
                            {v.toppings.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {v.toppings.map((tp, idx) => (
                                  <span key={idx} className="bg-slate-800 text-slate-200 border border-slate-700 text-xs px-2 py-0.5 rounded-md font-bold">
                                    + {tp}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Note highlight */}
                            {v.notes ? (
                              <div className="bg-amber-400/10 border border-amber-400/30 text-amber-200 text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 mt-1">
                                <span>Ghi chú:</span> {v.notes}
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-500 italic">Không có ghi chú thêm</div>
                            )}
                          </div>

                          {/* Checkmark icon */}
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                            isDone ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'
                          }`}>
                            <Check className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* ================= MODE 2: TICKETS VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map(({ order, items }) => {
            const statusConfig = STATUS_CONFIG[order.status] || {
              label: order.status,
              color: 'bg-slate-800 text-slate-300',
              icon: Clock,
            }
            const StatusIcon = statusConfig.icon

            return (
              <Card
                key={order.id}
                className="bg-slate-800/90 border-slate-700/80 shadow-xl overflow-hidden flex flex-col justify-between"
              >
                <CardHeader className="bg-slate-900/90 border-b border-slate-700/80 py-4 px-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xl font-black bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-lg">
                        #{order.id}
                      </span>
                      <h3 className="font-black text-white text-lg">{order.customer_name}</h3>
                    </div>

                    <Badge className={`px-2.5 py-1 text-xs font-bold border flex items-center gap-1 ${statusConfig.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Giờ đặt: {formatTime(order.created_at)}</p>
                </CardHeader>

                <CardContent className="p-5 space-y-3 flex-1">
                  {items.map((item) => {
                    let parsedToppings: string[] = []
                    if (item.toppings) {
                      try {
                        parsedToppings = JSON.parse(item.toppings)
                      } catch {}
                    }

                    return (
                      <div key={item.id} className="p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-base font-black px-2 py-0.5 rounded-md">
                            {item.quantity}x
                          </span>
                          <span className="font-extrabold text-white text-base">{item.menu_item_name}</span>
                        </div>

                        {parsedToppings.length > 0 && (
                          <div className="flex flex-wrap gap-1 pl-7">
                            {parsedToppings.map((tp, idx) => (
                              <span key={idx} className="bg-slate-800 text-slate-200 border border-slate-700 text-xs px-2 py-0.5 rounded-md font-semibold">
                                + {tp}
                              </span>
                            ))}
                          </div>
                        )}

                        {item.notes && (
                          <div className="bg-amber-400/10 border border-amber-400/30 text-amber-200 text-xs px-2.5 py-1 rounded-lg font-bold ml-7">
                            Ghi chú: {item.notes}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </CardContent>

                {/* Quick Kitchen Action Buttons */}
                <div className="p-4 bg-slate-900/60 border-t border-slate-700/80 flex items-center justify-between gap-2">
                  {order.status !== 'preparing' && order.status !== 'completed' && order.status !== 'delivering' && (
                    <Button
                      onClick={() => handleUpdateStatus(order.id, 'preparing')}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs gap-1.5 py-4"
                    >
                      <Flame className="w-4 h-4" /> Bắt Đầu Làm Bánh
                    </Button>
                  )}

                  {order.status === 'preparing' && (
                    <Button
                      onClick={() => handleUpdateStatus(order.id, 'completed')}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 py-4"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Đã Làm Xong
                    </Button>
                  )}

                  {order.status === 'completed' && (
                    <div className="w-full text-center text-xs font-bold text-emerald-400 py-1 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Đơn Hàng Đã Hoàn Thành
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
