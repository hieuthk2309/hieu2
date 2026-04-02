'use client'

import { ShoppingCart, Menu, X, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface HeaderProps {
  onCartClick: () => void
}

export function Header({ onCartClick }: HeaderProps) {
  const { totalItems } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hasOrder, setHasOrder] = useState(false)

  useEffect(() => {
    const checkOrder = () => {
      fetch('/api/orders/check')
        .then(r => r.json())
        .then(d => {
          if (!d.canOrder) setHasOrder(true)
        })
        .catch(() => {})
    }

    checkOrder()

    window.addEventListener('order-placed', checkOrder)
    return () => window.removeEventListener('order-placed', checkOrder)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">B</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">Bánh Mì Sài Gòn</h1>
              <p className="text-xs text-muted-foreground">Ngon - Nhanh - Tiện</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#menu" className="text-muted-foreground hover:text-foreground transition-colors">
              Thực Đơn
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              Giới Thiệu
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Liên Hệ
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {hasOrder && (
              <Link href="/orders">
                <Button variant="outline" size="icon" className="text-primary border-primary/20 hover:bg-primary/10 relative" title="Theo dõi đơn hàng">
                  <Package className="h-5 w-5" />
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card"></span>
                </Button>
              </Link>
            )}

            <Button
              variant="outline"
              size="icon"
              className="relative"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <a
                href="#menu"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Thực Đơn
              </a>
              <a
                href="#about"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Giới Thiệu
              </a>
              <a
                href="#contact"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Liên Hệ
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
