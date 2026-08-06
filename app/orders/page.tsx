'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Clock,
  User,
  Package,
  Receipt,
  ChevronLeft,
  Calendar,
  Edit2,
  Check,
  X,
  Loader2,
  AlertCircle,
  Trash2,
  CheckCircle2,
  Truck,
  ChefHat,
  PackageCheck,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

interface OrderItem {
  id: number
  menuItemName: string
  quantity: number
  menuItemPrice: number
  toppings: string[]
  notes: string | null
  subtotal: number
}

interface UserOrder {
  id: number
  date: string
  customerName: string
  total: number
  status: string
  createdAt: string
  items: OrderItem[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<UserOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null)
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null)
  const [tempNote, setTempNote] = useState('')
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null)
  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      const checkRes = await fetch('/api/orders/check')
      const checkData = await checkRes.json()

      const activeOrders: { id: number; date: string }[] = checkData.activeOrders || []
      if (activeOrders.length === 0) {
        setOrders([])
        return
      }

      const orderResults = await Promise.all(
        activeOrders.map(async (entry) => {
          const res = await fetch(`/api/orders/${entry.id}`)
          if (!res.ok) return null
          const data = await res.json()
          return {
            id: data.order.id,
            date: entry.date,
            customerName: data.order.customer_name,
            total: data.order.total,
            status: data.order.status,
            createdAt: data.order.created_at,
            items: data.items.map((item: any) => ({
              id: item.id,
              menuItemName: item.menu_item_name,
              quantity: item.quantity,
              menuItemPrice: item.menu_item_price,
              toppings: item.toppings ? JSON.parse(item.toppings) : [],
              notes: item.notes,
              subtotal: item.subtotal,
            })),
          } as UserOrder
        })
      )

      const validOrders = orderResults
        .filter((o): o is UserOrder => o !== null && o.status !== 'cancelled')
        .sort((a, b) => a.date.localeCompare(b.date))

      setOrders(validOrders)
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải đơn hàng')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleCancelOrder = async (orderId: number) => {
    setCancellingOrderId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      if (!res.ok) throw new Error('Không thể hủy đơn hàng')
      setOrders((prev) => prev.filter((o) => o.id !== orderId))
      setConfirmCancelId(null)
      window.dispatchEvent(new Event('order-placed'))
    } catch {
      alert('Không thể hủy đơn hàng. Vui lòng thử lại!')
    } finally {
      setCancellingOrderId(null)
    }
  }

  const handleEditNote = (item: OrderItem, orderId: number) => {
    setEditingNoteId(item.id)
    setEditingOrderId(orderId)
    setTempNote(item.notes || '')
  }

  const handleSaveNote = async (itemId: number, orderId: number) => {
    setIsSavingNote(true)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, notes: tempNote }),
      })
      if (!res.ok) throw new Error('Lưu thất bại')
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                items: order.items.map((item) =>
                  item.id === itemId ? { ...item, notes: tempNote } : item
                ),
              }
            : order
        )
      )
      setEditingNoteId(null)
      setEditingOrderId(null)
    } catch {
      alert('Không thể lưu ghi chú. Vui lòng thử lại!')
    } finally {
      setIsSavingNote(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`

    let prefix = ''
    if (dateStr === todayStr) prefix = 'Hôm nay - '
    else if (dateStr === tomorrowStr) prefix = 'Ngày mai - '

    return (
      prefix +
      date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    )
  }

  const canCancelOrder = (status: string) =>
    ['pending', 'confirmed'].includes(status)

  return (
    <div className="container mx-auto py-8 px-4 mt-6 max-w-3xl min-h-[calc(100vh-200px)]">
      <Link href="/">
        <Button variant="ghost" className="mb-6 -ml-4 flex gap-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" /> Quay lại trang chủ
        </Button>
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Receipt className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Đơn Hàng Đặt Trước</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Danh sách đơn hàng bạn đã đặt trước từ thiết bị này
          </p>
        </div>
      </div>

      {isLoading ? (
        <Card className="flex flex-col items-center justify-center py-20 border border-border/50 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-primary opacity-60 mb-4" />
          <p className="text-muted-foreground font-medium animate-pulse">Đang tải danh sách đơn hàng...</p>
        </Card>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 flex gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      ) : orders.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 border border-border/50 shadow-sm text-center px-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Bạn chưa đặt hàng trước nào từ thiết bị này. Hãy xem thực đơn và đặt ngay nhé!
          </p>
          <Link href="/">
            <Button>Xem thực đơn & Đặt hàng trước</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status] || {
              label: order.status,
              color: 'bg-gray-100 text-gray-800',
              icon: Clock,
            }
            const StatusIcon = statusConfig.icon
            const isConfirmingCancel = confirmCancelId === order.id
            const isCancelling = cancellingOrderId === order.id

            return (
              <Card key={order.id} className="border-border shadow-sm overflow-hidden border-t-4 border-t-primary/50">
                <CardHeader className="bg-muted/10 border-b border-border py-4 px-5 md:px-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.04]">
                    <Calendar className="w-28 h-28" />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative z-10">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2 mb-1">
                        <span className="font-mono text-primary bg-primary/10 px-2.5 py-0.5 rounded-md text-base">
                          #{order.id}
                        </span>
                        <span className="text-foreground font-bold">{order.customerName}</span>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5 text-sm font-medium capitalize">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {formatDate(order.date)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <Badge className={`px-3 py-1 text-xs border font-medium flex items-center gap-1.5 ${statusConfig.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig.label}
                      </Badge>

                      {/* Nút Hủy đơn */}
                      {canCancelOrder(order.status) && (
                        <>
                          {isConfirmingCancel ? (
                            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-1.5">
                              <span className="text-xs text-destructive font-semibold">Xác nhận hủy?</span>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-6 text-xs px-2"
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={isCancelling}
                              >
                                {isCancelling ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Hủy đơn'}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-xs px-2"
                                onClick={() => setConfirmCancelId(null)}
                              >
                                Giữ lại
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setConfirmCancelId(order.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Hủy đơn
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 md:px-6 bg-card space-y-4">
                  {/* Thông tin người đặt */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4 text-primary" />
                    <span>Người đặt: <strong className="text-foreground">{order.customerName}</strong></span>
                  </div>

                  {/* Danh sách món */}
                  <div className="space-y-3">
                    {order.items.map((item) => {
                      const isEditing = editingNoteId === item.id && editingOrderId === order.id
                      return (
                        <div key={item.id} className="flex gap-3 p-3 rounded-xl border border-border bg-card">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 text-sm">
                            {item.quantity}x
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <h4 className="font-bold text-foreground text-sm leading-tight">{item.menuItemName}</h4>
                              <span className="font-semibold text-foreground text-sm shrink-0">{formatPrice(item.subtotal)}</span>
                            </div>

                            {item.toppings && item.toppings.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.toppings.map((t, idx) => (
                                  <span key={idx} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md font-medium">
                                    + {t}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Ghi chú */}
                            {isEditing ? (
                              <div className="mt-2 flex flex-col gap-2 bg-muted/30 p-2.5 rounded-lg border border-border">
                                <Input
                                  value={tempNote}
                                  onChange={(e) => setTempNote(e.target.value)}
                                  placeholder="Nhập ghi chú cho món này..."
                                  className="h-8 text-sm"
                                  autoFocus
                                />
                                <div className="flex gap-2 justify-end">
                                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setEditingNoteId(null); setEditingOrderId(null) }}>
                                    <X className="w-3.5 h-3.5 mr-1" /> Hủy
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs"
                                    disabled={isSavingNote}
                                    onClick={() => handleSaveNote(item.id, order.id)}
                                  >
                                    {isSavingNote ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1" />}
                                    Lưu
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-2 text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 p-2 rounded-lg border border-amber-200 dark:border-amber-900/50 flex gap-2 items-center justify-between group">
                                <span>
                                  <span className="font-semibold">Ghi chú:</span>{' '}
                                  <i>{item.notes || 'Không có ghi chú'}</i>
                                </span>
                                {order.status === 'pending' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 text-amber-800/60 hover:text-amber-900 hover:bg-amber-200/50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                    onClick={() => handleEditNote(item, order.id)}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <Separator className="my-1" />

                  {/* Tổng */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tổng tiền đơn hàng</span>
                    <span className="text-xl font-extrabold text-primary">{formatPrice(order.total)}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Thống kê tổng */}
          <Card className="border-border/60 bg-muted/20 p-5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Tổng số đơn đặt trước:</span>
              <span className="font-bold text-foreground">{orders.length} đơn</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-muted-foreground">Tổng giá trị đặt trước:</span>
              <span className="text-xl font-extrabold text-primary">
                {formatPrice(orders.reduce((sum, o) => sum + o.total, 0))}
              </span>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}


