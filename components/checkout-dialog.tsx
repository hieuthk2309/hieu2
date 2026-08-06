'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Loader2, Calendar, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useCart } from '@/lib/cart-context'

interface CheckoutDialogProps {
  open: boolean
  onClose: () => void
}

interface DateOption {
  dateStr: string
  dayLabel: string
  isToday: boolean
}

const getUpcomingDays = (count = 7): DateOption[] => {
  const days: DateOption[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 1; i <= count; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    const weekdayLabel = d.toLocaleDateString('vi-VN', { weekday: 'short' })
    const dayMonth = `${day}/${month}`

    let dayLabel = ''
    if (i === 1) dayLabel = `Ngày mai (${dayMonth})`
    else dayLabel = `${weekdayLabel} (${dayMonth})`

    days.push({
      dateStr,
      dayLabel,
      isToday: i === 0,
    })
  }

  return days
}

export function CheckoutDialog({ open, onClose }: CheckoutDialogProps) {
  const { items, totalPrice, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [createdOrderIds, setCreatedOrderIds] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [orderedDates, setOrderedDates] = useState<string[]>([])
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
  })

  const upcomingDays = getUpcomingDays(7)

  useEffect(() => {
    if (open) {
      setIsChecking(true)
      fetch('/api/orders/check')
        .then((res) => res.json())
        .then((data) => {
          const booked: string[] = data.orderedDates || []
          setOrderedDates(booked)

          // Chọn mặc định ngày hôm nay nếu chưa đặt, hoặc ngày khả dụng đầu tiên
          const available = upcomingDays.filter((d) => !booked.includes(d.dateStr))
          if (available.length > 0) {
            setSelectedDates([available[0].dateStr])
          } else {
            setSelectedDates([])
          }
        })
        .catch(() => {
          setOrderedDates([])
          if (upcomingDays.length > 0) {
            setSelectedDates([upcomingDays[0].dateStr])
          }
        })
        .finally(() => {
          setIsChecking(false)
        })
    }
  }, [open])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const toggleDate = (dateStr: string) => {
    if (orderedDates.includes(dateStr)) return

    setSelectedDates((prev) => {
      if (prev.includes(dateStr)) {
        if (prev.length === 1) return prev // Tối thiểu giữ 1 ngày
        return prev.filter((d) => d !== dateStr)
      } else {
        return [...prev, dateStr]
      }
    })
  }

  const grandTotal = totalPrice * selectedDates.length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedDates.length === 0) {
      setError('Vui lòng chọn ít nhất 1 ngày giao hàng.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: formData.name,
          dates: selectedDates,
          items: items.map((item) => {
            const toppingPrice = item.selectedToppings ? item.selectedToppings.reduce((total, t) => total + t.price, 0) : 0
            const itemPrice = item.menuItem.price + toppingPrice
            return {
              menuItemId: item.menuItem.id,
              menuItemName: item.menuItem.name,
              menuItemPrice: item.menuItem.price,
              quantity: item.quantity,
              toppings: item.selectedToppings ? item.selectedToppings.map((t) => t.name) : [],
              notes: item.notes,
              subtotal: itemPrice * item.quantity,
            }
          }),
          total: totalPrice,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi đặt hàng trước')
      }

      setCreatedOrderIds(data.orderIds || [data.orderId])
      setIsSuccess(true)
      clearCart()
      window.dispatchEvent(new Event('order-placed'))

      setTimeout(() => {
        setIsSuccess(false)
        setCreatedOrderIds([])
        setFormData({ name: '' })
        onClose()
      }, 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setIsSuccess(false)
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Đặt Hàng Trước (Pre-order)
          </DialogTitle>
          <DialogDescription>
            Chọn một hoặc nhiều ngày giao hàng cho cùng thực đơn này (mỗi ngày sẽ tạo 1 đơn riêng)
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1">
          {isChecking ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Đang kiểm tra ngày khả dụng...</p>
            </div>
          ) : isSuccess ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Đặt Hàng Trước Thành Công!
              </h3>
              <p className="text-sm text-muted-foreground">
                Đã khởi tạo thành công <strong className="text-primary">{createdOrderIds.length} đơn hàng</strong> riêng biệt cho các ngày bạn đã chọn.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {createdOrderIds.map((id) => (
                  <Badge key={id} variant="secondary" className="font-mono text-xs py-1 px-2.5">
                    Đơn #{id}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Tóm tắt giỏ hàng 1 ngày */}
              <div className="bg-muted/40 rounded-xl p-4 space-y-2 border border-border/50">
                <h4 className="font-bold text-xs uppercase text-muted-foreground tracking-wider">
                  Món ăn áp dụng cho từng ngày
                </h4>
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start text-sm border-b border-border/40 pb-2 last:border-0 last:pb-0">
                    <div>
                      <span className="font-bold text-foreground">
                        {item.quantity}x {item.menuItem.name}
                      </span>
                      {item.selectedToppings && item.selectedToppings.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          + {item.selectedToppings.map((t) => t.name).join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="font-medium text-foreground shrink-0">
                      {formatPrice((item.menuItem.price + (item.selectedToppings ? item.selectedToppings.reduce((s, t) => s + t.price, 0) : 0)) * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-border/60 flex justify-between text-xs font-semibold text-muted-foreground">
                  <span>Giá 1 đơn / 1 ngày:</span>
                  <span className="text-foreground">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Bộ chọn nhiều ngày */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <Label className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" />
                    Chọn các ngày nhận đơn:
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Đã chọn: <strong className="text-primary font-bold">{selectedDates.length}</strong> ngày
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {upcomingDays.map((day) => {
                    const isBooked = orderedDates.includes(day.dateStr)
                    const isSelected = selectedDates.includes(day.dateStr)

                    return (
                      <button
                        type="button"
                        key={day.dateStr}
                        onClick={() => toggleDate(day.dateStr)}
                        disabled={isBooked}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all select-none ${
                          isBooked
                            ? 'bg-muted/40 border-border/40 text-muted-foreground cursor-not-allowed opacity-75'
                            : isSelected
                            ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                            : 'bg-card border-border hover:border-primary/50 text-foreground'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-sm block capitalize">{day.dayLabel}</span>
                          {isBooked ? (
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block">
                              Đã có 1 đơn hàng (Hủy đơn cũ để đặt lại)
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground block">
                              {formatPrice(totalPrice)} / đơn
                            </span>
                          )}
                        </div>

                        {isSelected && !isBooked && (
                          <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Họ và Tên */}
              <div className="space-y-2">
                <Label htmlFor="name">Họ và Tên người đặt</Label>
                <Input
                  id="name"
                  placeholder="Nhập họ và tên của bạn"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  required
                />
              </div>

              {/* Tổng thanh toán động */}
              <div className="p-3.5 bg-primary/5 rounded-xl border border-primary/20 space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Số đơn tạo ra:</span>
                  <span className="font-bold text-foreground">{selectedDates.length} đơn hàng</span>
                </div>
                <div className="flex justify-between items-center text-base pt-1 border-t border-primary/10 font-bold">
                  <span className="text-foreground">Tổng tiền thanh toán:</span>
                  <span className="text-primary text-xl">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-bold gap-2"
                disabled={isSubmitting || selectedDates.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xử lý tạo đơn...
                  </>
                ) : (
                  `Xác Nhận Đặt ${selectedDates.length} Đơn - ${formatPrice(grandTotal)}`
                )}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

