'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, AlertTriangle, X } from 'lucide-react'

interface OrderData {
  id: number
  customer_name: string
  total: number
  status: string
  created_at: string
}

interface DeleteOrderDialogProps {
  order: OrderData | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (deletedOrderId: number) => void
}

export function DeleteOrderDialog({
  order,
  isOpen,
  onClose,
  onSuccess,
}: DeleteOrderDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!order) return
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Xóa đơn hàng thất bại')
      }

      onSuccess(order.id)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi xóa đơn hàng')
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
      <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl p-0 overflow-hidden">
        {/* Warning Header */}
        <div className="bg-rose-500/10 p-6 border-b border-rose-500/20">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <span>Xóa Đơn Hàng Vĩnh Viễn</span>
                  <Badge variant="outline" className="font-mono text-xs border-rose-500/30 text-rose-600 dark:text-rose-400">
                    #{order.id}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Hành động này sẽ xóa hoàn toàn dữ liệu đơn hàng khỏi hệ thống
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Cảnh báo không thể hoàn tác:</p>
              <p className="text-[11px] opacity-90 mt-0.5">
                Bạn có chắc chắn muốn xóa đơn hàng <strong>#{order.id}</strong> của khách hàng <strong>&ldquo;{order.customer_name}&rdquo;</strong> (Tổng tiền: <strong>{formatPrice(order.total)}</strong>)?
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-xs">
              {error}
            </div>
          )}
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
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading}
            className="text-xs font-semibold gap-1.5 bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
          >
            {isLoading ? (
              <span>Đang xóa...</span>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xác nhận xóa</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
