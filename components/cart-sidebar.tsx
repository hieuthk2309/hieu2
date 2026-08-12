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
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <ShoppingBag className="w-12 h-12 text-primary/60" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2 tracking-tight">Giỏ hàng đang trống</h3>
            <p className="text-sm text-muted-foreground w-3/4 mx-auto leading-relaxed">
              Hãy chọn ngay một ổ bánh mì chả cá thật giòn ngon để tiến hành đặt hàng nhé!
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto py-4 space-y-4 px-1">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="bg-card border border-border/40 rounded-2xl p-4 space-y-3 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    {item.menuItem.image && (
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-border/40"
                      />
                    )}
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

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-full border border-border/40">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-background hover:shadow-sm"
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </Button>
                      <span className="w-8 text-center font-bold text-foreground tabular-nums">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-background hover:shadow-sm"
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <span className="font-bold text-primary">
                      {formatPrice(getItemTotal(item))}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-6 pb-2 space-y-5">
              <div className="flex items-center justify-between px-1">
                <span className="text-muted-foreground font-medium">Tổng cộng</span>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-500">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-[0.4] rounded-xl border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                  onClick={clearCart}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button className="flex-1 rounded-xl font-bold text-md shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300" onClick={onCheckout}>
                  Tiến Hành Đặt Hàng
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
