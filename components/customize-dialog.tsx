'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { useCart } from '@/lib/cart-context'
import { toppings } from '@/lib/menu-data'
import type { MenuItem, Topping } from '@/lib/types'

interface CustomizeDialogProps {
  item: MenuItem | null
  open: boolean
  onClose: () => void
}

export function CustomizeDialog({ item, open, onClose }: CustomizeDialogProps) {
  const { addItem } = useCart()
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([])
  const [notes, setNotes] = useState('')

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const handleToppingToggle = (topping: Topping) => {
    setSelectedToppings((prev) => {
      const exists = prev.find((t) => t.id === topping.id)
      if (exists) {
        return prev.filter((t) => t.id !== topping.id)
      }
      return [...prev, topping]
    })
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
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🥖</span>
            {item.name}
          </DialogTitle>
          <DialogDescription>
            Tùy chỉnh topping và ghi chú cho món ăn của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 overflow-y-auto flex-1">
          {/* Item Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
            <p className="text-lg font-bold text-primary">
              {formatPrice(item.price)}
            </p>
          </div>

          {/* Toppings */}
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Thêm Topping</h4>
            <div className="space-y-2">
              {toppings.map((topping) => (
                <label
                  key={topping.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedToppings.some((t) => t.id === topping.id)}
                      onCheckedChange={() => handleToppingToggle(topping)}
                    />
                    <span className="text-sm text-foreground">{topping.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {topping.price > 0 ? `+${formatPrice(topping.price)}` : 'Miễn phí'}
                  </span>
                </label>
              ))}
            </div>
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
          <Button onClick={handleAddToCart} className="w-full sm:w-auto">
            <Check className="w-4 h-4 mr-2" />
            Thêm - {formatPrice(calculateTotal())}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
