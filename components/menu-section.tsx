'use client'

import { useState } from 'react'
import { MenuCard } from './menu-card'
import { CustomizeDialog } from './customize-dialog'
import { Button } from '@/components/ui/button'
import { menuItems, categories } from '@/lib/menu-data'
import type { MenuItem } from '@/lib/types'

export function MenuSection() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [customizeOpen, setCustomizeOpen] = useState(false)

  const filteredItems =
    selectedCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory)

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
            Khám phá các loại bánh mì thơm ngon, được làm từ nguyên liệu tươi mới mỗi ngày
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
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

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="flex">
              <MenuCard item={item} onAddClick={handleAddClick} />
            </div>
          ))}
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
