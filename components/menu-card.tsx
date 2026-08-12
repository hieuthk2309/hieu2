'use client'

import { Plus, Star, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { MenuItem } from '@/lib/types'

interface MenuCardProps {
  item: MenuItem
  onAddClick: (item: MenuItem) => void
  onBuyNowClick?: (item: MenuItem) => void
  isDrink?: boolean
}

export function MenuCard({ item, onAddClick, onBuyNowClick, isDrink = false }: MenuCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const emoji = isDrink
    ? item.name.toLowerCase().includes('trà') ? '🍋' : '☕'
    : '🥖'

  const gradientClass = isDrink
    ? 'from-amber-500/20 to-orange-400/20'
    : 'from-primary/20 to-accent/20'

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <div className="relative h-48 shrink-0 overflow-hidden bg-muted">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
            <span className="text-6xl">{emoji}</span>
          </div>
        )}
        {item.popular && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 z-10">
            <Star className="w-3 h-3 fill-current" />
            Bán Chạy
          </div>
        )}
        {isDrink && (
          <div className="absolute top-2 right-2 bg-amber-500/90 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
            Đồ Uống
          </div>
        )}
      </div>
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground leading-tight">{item.name}</h3>
          <span className="text-primary font-bold whitespace-nowrap">
            {formatPrice(item.price)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
          {item.description}
        </p>

        <div className="flex gap-2 mt-auto pt-2">
          <Button
            variant="outline"
            className="flex-1 text-xs px-2 sm:px-3 h-9"
            onClick={() => onAddClick(item)}
          >
            <Plus className="w-3.5 h-3.5 mr-1 shrink-0" />
            Thêm Vào Giỏ
          </Button>

          {onBuyNowClick && (
            <Button
              className="flex-1 text-xs px-2 sm:px-3 h-9 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-xs"
              onClick={() => onBuyNowClick(item)}
            >
              <Zap className="w-3.5 h-3.5 mr-1 fill-current shrink-0" />
              Mua Ngay
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
