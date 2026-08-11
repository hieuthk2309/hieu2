'use client'

import { useState } from 'react'
import { MenuCard } from './menu-card'
import { CustomizeDialog } from './customize-dialog'
import { Button } from '@/components/ui/button'
import { foodItems, drinkItems, categories } from '@/lib/menu-data'
import type { MenuItem } from '@/lib/types'
import { Coffee, Sandwich } from 'lucide-react'

export function MenuSection() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [customizeOpen, setCustomizeOpen] = useState(false)

  const filteredFoodItems =
    selectedCategory === 'all'
      ? foodItems
      : foodItems.filter((item) => item.category === selectedCategory)

  const handleAddClick = (item: MenuItem) => {
    setSelectedItem(item)
    setCustomizeOpen(true)
  }

  return (
    <section id="menu" className="py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Thực Đơn
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Khám phá các loại bánh mì thơm ngon và đồ uống tươi mát, được làm từ nguyên liệu tươi mới mỗi ngày
          </p>
        </div>

        {/* ===== FOOD SECTION ===== */}
        <div className="mb-14">
          {/* Food Section Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0">
              <Sandwich className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Bánh Mì</h3>
              <p className="text-xs text-muted-foreground">Các loại bánh mì tươi ngon</p>
            </div>
            <div className="flex-1 h-px bg-border ml-2" />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="rounded-full"
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Food Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFoodItems.map((item) => (
              <div key={item.id} className="flex">
                <MenuCard item={item} onAddClick={handleAddClick} />
              </div>
            ))}
          </div>
        </div>

        {/* ===== DRINKS SECTION ===== */}
        <div>
          {/* Drinks Section Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Món Nước</h3>
              <p className="text-xs text-muted-foreground">Đồ uống tươi mát giải khát</p>
            </div>
            <div className="flex-1 h-px bg-border ml-2" />
          </div>

          {/* Drinks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {drinkItems.map((item) => (
              <div key={item.id} className="flex">
                <MenuCard item={item} onAddClick={handleAddClick} isDrink />
              </div>
            ))}
          </div>
        </div>

        {/* Customize Dialog */}
        <CustomizeDialog
          item={selectedItem}
          open={customizeOpen}
          onClose={() => {
            setCustomizeOpen(false)
            setSelectedItem(null)
          }}
        />
      </div>
    </section>
  )
}
