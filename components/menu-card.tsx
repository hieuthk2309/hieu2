'use client'

import { Plus, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { MenuItem } from '@/lib/types'

interface MenuCardProps {
  item: MenuItem
  onAddClick: (item: MenuItem) => void
}

export function MenuCard({ item, onAddClick }: MenuCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <span className="text-6xl">🥖</span>
        </div>
        {item.popular && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Bán Chạy
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
        <Button
          className="w-full"
          onClick={() => onAddClick(item)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm Vào Giỏ
        </Button>
      </CardContent>
    </Card>
  )
}
