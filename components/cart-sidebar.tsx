'use client'

import { Minus, Plus, Trash2, X, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

interface CartSidebarProps {
  open: boolean
  onClose: () => void
  onCheckout: () => void
}

export function CartSidebar({ open, onClose, onCheckout }: CartSidebarProps) {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const getItemTotal = (item: typeof items[0]) => {
    const basePrice = item.menuItem.price
    const toppingsPrice = item.selectedToppings.reduce((sum, t) => sum + t.price, 0)
    return (basePrice + toppingsPrice) * item.quantity
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Giỏ Hàng ({items.length} món)
          </SheetTitle>
          <SheetDescription>
            Xem và quản lý các món trong giỏ hàng của bạn
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Giỏ hàng trống</h3>
            <p className="text-sm text-muted-foreground">
              Thêm bánh mì vào giỏ để đặt hàng
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto py-4 space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="bg-muted/50 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">
                        {item.menuItem.name}
                      </h4>
                      {item.selectedToppings.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          + {item.selectedToppings.map((t) => t.name).join(', ')}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-xs text-muted-foreground italic mt-1">
                          Ghi chú: {item.notes}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold text-foreground">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className="font-bold text-primary">
                      {formatPrice(getItemTotal(item))}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tổng cộng</span>
                <span className="text-xl font-bold text-foreground">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={clearCart}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa Tất Cả
                </Button>
                <Button className="flex-1" onClick={onCheckout}>
                  Đặt Hàng
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
