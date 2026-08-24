'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Edit3,
  Calendar,
  User,
  AlertCircle,
  Save,
  Clock,
  Lock,
  DollarSign,
  CheckCircle2,
} from 'lucide-react'

interface OrderData {
  id: number
  customer_name: string
  total: number
  status: string
  created_at: string
}

interface EditOrderDialogProps {
  order: OrderData | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedOrder: { id: number; customer_name: string; created_at: string }) => void
}

export function EditOrderDialog({
  order,
  isOpen,
  onClose,
  onSuccess,
}: EditOrderDialogProps) {
  const [customerName, setCustomerName] = useState('')
  const [dateValue, setDateValue] = useState('')
  const [timeValue, setTimeValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (order) {
      setCustomerName(order.customer_name || '')
      try {
        const d = new Date(order.created_at)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        setDateValue(`${year}-${month}-${day}`)

        const hours = String(d.getHours()).padStart(2, '0')
        const minutes = String(d.getMinutes()).padStart(2, '0')
        setTimeValue(`${hours}:${minutes}`)
      } catch {
        setDateValue('')
        setTimeValue('')
      }
      setError(null)
    }
  }, [order, isOpen])

  const handleSave = async () => {
    if (!order) return
    if (!customerName.trim()) {
      setError('Vui lòng nhập tên khách hàng')
      return
    }
    if (!dateValue) {
      setError('Vui lòng chọn ngày đặt hàng')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Build ISO string from selected date and time
      const timePart = timeValue || '12:00'
      const [hours, minutes] = timePart.split(':').map(Number)
      const [year, month, day] = dateValue.split('-').map(Number)

      const targetDate = new Date(year, month - 1, day, hours, minutes, 0)
      const isoCreatedAt = targetDate.toISOString()

      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          created_at: isoCreatedAt,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Cập nhật đơn hàng thất bại')
      }

      onSuccess({
        id: order.id,
        customer_name: customerName.trim(),
        created_at: isoCreatedAt,
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lưu thay đổi')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card border-border shadow-2xl p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-6 border-b border-border/60">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shadow-xs">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>Chỉnh Sửa Đơn Hàng</span>
                  <Badge variant="outline" className="font-mono text-xs bg-background">
                    #{order.id}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Cập nhật thông tin khách hàng và ngày giờ phát sinh đơn hàng
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-5">
          {/* Strict Policy Notice */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Quy định bảo mật & dữ liệu:</p>
              <p className="text-[11px] opacity-90 mt-0.5">
                Hệ thống chỉ cho phép thay đổi <strong>Tên người đặt</strong> và <strong>Ngày giờ đặt</strong>. Danh sách món và tổng số tiền được giữ nguyên để bảo đảm tính toàn vẹn doanh thu.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Field 1: Customer Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                Tên khách hàng đặt đơn <span className="text-rose-500">*</span>
              </label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nhập tên khách hàng..."
                className="text-sm font-medium h-10 bg-background"
                disabled={isLoading}
              />
            </div>

            {/* Field 2: Order Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Ngày đặt <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="date"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  className="text-sm font-medium h-10 bg-background"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  Giờ đặt
                </label>
                <Input
                  type="time"
                  value={timeValue}
                  onChange={(e) => setTimeValue(e.target.value)}
                  className="text-sm font-medium h-10 bg-background"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Readonly Info Section */}
            <div className="pt-2 border-t border-border/60">
              <div className="bg-muted/40 rounded-xl p-3 border border-border/50 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Tổng giá trị đơn:</span>
                  <span className="font-bold text-foreground text-sm flex items-center gap-1 mt-0.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {formatPrice(order.total)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Trạng thái hiện tại:</span>
                  <span className="font-semibold text-foreground text-xs block mt-1 capitalize">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/30 p-4 border-t border-border flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs font-semibold"
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
            className="text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
          >
            {isLoading ? (
              <span>Đang lưu...</span>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
