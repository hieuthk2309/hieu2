'use client'

import { useState } from 'react'
import { Check, X, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useCart } from '@/lib/cart-context'
import { getNextWorkingDay } from '@/lib/date-utils'
import type { MenuItem, Topping } from '@/lib/types'

interface CustomizeDialogProps {
  item: MenuItem | null
  open: boolean
  onClose: () => void
  onBuyNow?: (item: MenuItem, toppings: Topping[], notes?: string) => void
}

export function CustomizeDialog({ item, open, onClose, onBuyNow }: CustomizeDialogProps) {
  const { addItem } = useCart()
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([])
  const [notes, setNotes] = useState('')

  const nextWorkingDay = getNextWorkingDay()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const calculateTotal = () => {
    if (!item) return 0
    return (
      item.price + selectedToppings.reduce((sum, t) => sum + t.price, 0)
    )
  }

  const handleAddToCart = () => {
    if (!item) return
    addItem(item, selectedToppings, notes)
    setSelectedToppings([])
    setNotes('')
    onClose()
  }

  const handleBuyNowClick = () => {
    if (!item || !onBuyNow) return
    const toppingsCopy = [...selectedToppings]
    const notesCopy = notes
    setSelectedToppings([])
    setNotes('')
    onClose()
    onBuyNow(item, toppingsCopy, notesCopy)
  }

  const handleClose = () => {
    setSelectedToppings([])
    setNotes('')
    onClose()
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            {!item.image && <span className="text-2xl">🥖</span>}
            {item.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4 overflow-y-auto flex-1">
          {item.image && (
            <div className="relative h-44 rounded-xl overflow-hidden bg-muted border border-border/40 shadow-xs">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Item Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
            <p className="text-lg font-bold text-primary">
              {formatPrice(item.price)}
            </p>
          </div>

          {/* Notes */}
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Ghi Chú</h4>
            <Textarea
              placeholder="Ví dụ: Ít ớt, nhiều rau..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 flex-shrink-0">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
            <X className="w-4 h-4 mr-2" />
            Hủy
          </Button>

          <Button variant="secondary" onClick={handleAddToCart} className="w-full sm:w-auto">
            <Check className="w-4 h-4 mr-2" />
            Thêm Vào Giỏ
          </Button>

          {onBuyNow && (
            <Button
              onClick={handleBuyNowClick}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold"
            >
              <Zap className="w-4 h-4 mr-1.5 fill-current" />
              Mua Ngay
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
