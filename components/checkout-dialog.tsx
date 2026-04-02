'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
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

export function CheckoutDialog({ open, onClose }: CheckoutDialogProps) {
  const { items, totalPrice, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [canOrder, setCanOrder] = useState(true)
  const [isChecking, setIsChecking] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
  })

  useEffect(() => {
    if (open) {
      setIsChecking(true)
      fetch('/api/orders/check')
        .then((res) => res.json())
        .then((data) => {
          setCanOrder(data.canOrder)
          if (!data.canOrder) {
            setError(data.message)
          }
        })
        .catch(() => {
          setCanOrder(true)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
          items: items.map((item) => {
            const toppingPrice = item.selectedToppings ? item.selectedToppings.reduce((total, t) => total + t.price, 0) : 0;
            const itemPrice = item.menuItem.price + toppingPrice;
            return {
              menuItemId: item.menuItem.id,
              menuItemName: item.menuItem.name,
              menuItemPrice: item.menuItem.price,
              quantity: item.quantity,
              toppings: item.selectedToppings ? item.selectedToppings.map((t) => t.name) : [],
              notes: item.notes,
              subtotal: itemPrice * item.quantity,
            };
          }),
          total: totalPrice,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Co loi xay ra khi dat hang')
      }

      setOrderId(data.orderId)
      setIsSuccess(true)
      setCanOrder(false)
      clearCart()
      window.dispatchEvent(new Event('order-placed'))

      setTimeout(() => {
        setIsSuccess(false)
        setOrderId(null)
        setFormData({
          name: '',
        })
        onClose()
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Co loi xay ra')
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
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Xac Nhan Don Hang</DialogTitle>
          <DialogDescription>
            Dien thong tin giao hang de hoan tat don hang
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isChecking ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Dang kiem tra...</p>
            </div>
          ) : !canOrder && !isSuccess ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Ban da dat hang hom nay roi!
              </h3>
              <p className="text-muted-foreground mb-4">
                Vui long quay lai vao ngay mai de dat hang tiep.
              </p>
              <Button variant="outline" onClick={onClose}>
                Dong
              </Button>
            </div>
          ) : isSuccess ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Dat Hang Thanh Cong!
              </h3>
              {orderId && (
                <p className="text-sm font-mono bg-muted px-3 py-1 rounded-md inline-block mb-2">
                  Ma don: {orderId}
                </p>
              )}
              <p className="text-muted-foreground">
                Chung toi se lien he ban trong it phut
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm text-foreground">Tom Tat Don Hang</h4>
                {items.map((item, index) => (
                  <div key={index} className="flex flex-col text-sm border-b border-border/50 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">
                        {item.quantity}x {item.menuItem.name}
                      </span>
                    </div>
                    {item.selectedToppings && item.selectedToppings.length > 0 && (
                      <span className="text-xs text-muted-foreground mt-0.5 pl-4">
                        + {item.selectedToppings.map(t => t.name).join(', ')}
                      </span>
                    )}
                    {item.notes && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 pl-4 italic">
                        Ghi chú: {item.notes}
                      </span>
                    )}
                  </div>
                ))}
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Tong cong</span>
                    <span className="text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ho va Ten</Label>
                  <Input
                    id="name"
                    placeholder="Nhap ho va ten"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Dang xu ly...
                  </>
                ) : (
                  `Xac Nhan Dat Hang - ${formatPrice(totalPrice)}`
                )}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
