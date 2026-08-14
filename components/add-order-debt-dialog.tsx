'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Wallet,
  Receipt,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Plus,
} from 'lucide-react'
import { CustomerSelect2, CustomerOption } from '@/components/customer-select2'

interface OrderData {
  id: number
  customer_name: string
  total: number
  status: string
  created_at: string
}

interface AddOrderDebtDialogProps {
  order: OrderData | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedCustomer: any, amountAdded: number) => void
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

function removeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}

export function AddOrderDebtDialog({
  order,
  isOpen,
  onClose,
  onSuccess,
}: AddOrderDebtDialogProps) {
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [amount, setAmount] = useState<number>(0)
  const [note, setNote] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch customers list when dialog opens
  const fetchCustomers = async () => {
    try {
      setIsLoadingCustomers(true)
      const res = await fetch('/api/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.customers || [])
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách khách hàng:', err)
    } finally {
      setIsLoadingCustomers(false)
    }
  }

  useEffect(() => {
    if (isOpen && order) {
      fetchCustomers()
      setAmount(order.total || 0)
      setNote(`Cộng nợ đơn #${order.id} (${order.customer_name})`)
      setError(null)
      setSelectedCustomerId(null)
    }
  }, [isOpen, order])

  // Try auto-matching customer by order's customer name
  useEffect(() => {
    if (order && customers.length > 0 && !selectedCustomerId) {
      const orderNameClean = removeAccents(order.customer_name || '')
      const matched = customers.find(
        (c) => removeAccents(c.name || '') === orderNameClean
      )
      if (matched) {
        setSelectedCustomerId(String(matched.id))
      }
    }
  }, [order, customers, selectedCustomerId])

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => String(c.id) === String(selectedCustomerId)) || null
  }, [customers, selectedCustomerId])

  const currentDebt = selectedCustomer?.debt || 0
  const debtToAdd = Number(amount) || 0
  const newDebt = Math.max(0, currentDebt + debtToAdd)

  const handleSelectCustomer = (customer: CustomerOption | null) => {
    setSelectedCustomerId(customer ? String(customer.id) : null)
    setError(null)
  }

  const handleCustomerCreated = (newCustomer: CustomerOption) => {
    setCustomers((prev) => [newCustomer, ...prev])
    setSelectedCustomerId(String(newCustomer.id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomerId) {
      setError('Vui lòng chọn khách hàng để cộng công nợ.')
      return
    }

    if (debtToAdd <= 0) {
      setError('Số tiền cộng nợ phải lớn hơn 0.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const res = await fetch(`/api/customers/${selectedCustomerId}/add-debt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order?.id,
          amount: debtToAdd,
          note: note.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Cộng công nợ thất bại')
      }

      onSuccess(data.customer, debtToAdd)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi cộng công nợ.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-border">
        {/* Header with gradient accent */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xs">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white tracking-tight">
                  Cộng Công Nợ Cho Khách Hàng
                </DialogTitle>
                <DialogDescription className="text-white/80 text-xs mt-0.5">
                  Ghi nhận công nợ từ đơn hàng #{order.id} vào sổ nợ khách hàng
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-foreground">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Order Summary Info Box */}
          <div className="bg-muted/40 rounded-xl p-3.5 border border-border/60 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-primary" /> Thông tin đơn hàng
              </div>
              <div className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <span className="font-mono bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                  #{order.id}
                </span>
                <span>{order.customer_name}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-muted-foreground font-medium">Tổng tiền đơn</div>
              <div className="text-base font-extrabold text-primary">
                {formatPrice(order.total)}
              </div>
            </div>
          </div>

          {/* Customer Selection (Select2) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Chọn khách hàng ghi nợ <span className="text-rose-500">*</span>
              </Label>
              {isLoadingCustomers && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Đang tải...
                </span>
              )}
            </div>

            <CustomerSelect2
              customers={customers}
              selectedCustomerId={selectedCustomerId}
              onSelectCustomer={handleSelectCustomer}
              onCustomerCreated={handleCustomerCreated}
              placeholder="Gõ tìm kiếm hoặc chọn khách hàng (Select2)..."
            />
            <p className="text-[11px] text-muted-foreground">
              Hỗ trợ tìm kiếm theo tên không dấu hoặc số điện thoại, có thể tạo mới ngay nếu chưa có.
            </p>
          </div>

          {/* Amount to add */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">
              Số tiền cộng vào công nợ (VNĐ) <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              min={0}
              step={1000}
              placeholder="Nhập số tiền..."
              className="font-bold text-sm h-10"
              required
            />
          </div>

          {/* Debt Calculation Preview Card */}
          {selectedCustomer && (
            <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-3.5 space-y-2">
              <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                Bảng tính công nợ của: <span className="underline">{selectedCustomer.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-background rounded-lg p-2 border shadow-2xs">
                  <div className="text-[11px] text-muted-foreground font-medium">Nợ hiện tại</div>
                  <div className="text-xs font-bold text-foreground mt-0.5">
                    {formatPrice(currentDebt)}
                  </div>
                </div>

                <div className="bg-background rounded-lg p-2 border shadow-2xs border-indigo-200 dark:border-indigo-800">
                  <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">+ Cộng thêm</div>
                  <div className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    +{formatPrice(debtToAdd)}
                  </div>
                </div>

                <div className="bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg p-2 shadow-2xs">
                  <div className="text-[11px] text-indigo-100 font-medium">Nợ sau khi cộng</div>
                  <div className="text-xs font-extrabold mt-0.5">
                    {formatPrice(newDebt)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Note Input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">
              Ghi chú công nợ (Tùy chọn)
            </Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Cộng nợ đơn #123..."
              className="text-xs h-9"
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs font-semibold"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedCustomerId || debtToAdd <= 0}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold gap-2 shadow-md shadow-indigo-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang ghi nhận...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Xác Nhận Cộng Công Nợ
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
