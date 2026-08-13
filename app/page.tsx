'use client'

import { useState } from 'react'
import { CartProvider } from '@/lib/cart-context'
import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { MenuSection } from '@/components/menu-section'
import { CartSidebar } from '@/components/cart-sidebar'
import { CheckoutDialog, type BuyNowItem } from '@/components/checkout-dialog'
import { DebtSearchSection } from '@/components/debt-search-section'
import { GoldenBoard } from '@/components/golden-board'
import { Footer } from '@/components/footer'
import type { MenuItem, Topping } from '@/lib/types'

function BanhMiApp() {
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [buyNowItem, setBuyNowItem] = useState<BuyNowItem | null>(null)

  const handleCheckout = () => {
    setBuyNowItem(null)
    setCartOpen(false)
    setCheckoutOpen(true)
  }

  const handleBuyNow = (item: MenuItem, toppings: Topping[], notes?: string) => {
    setBuyNowItem({ menuItem: item, selectedToppings: toppings, notes })
    setCartOpen(false)
    setCheckoutOpen(true)
  }

  const handleCloseCheckout = () => {
    setCheckoutOpen(false)
    setBuyNowItem(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onCartClick={() => setCartOpen(true)} />
      
      <main className="flex-1">
        <HeroSection />
        <GoldenBoard />
        <MenuSection onBuyNow={handleBuyNow} />
        <DebtSearchSection />
      </main>

      <Footer />

      <CartSidebar
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />

      <CheckoutDialog
        open={checkoutOpen}
        onClose={handleCloseCheckout}
        buyNowItem={buyNowItem}
      />
    </div>
  )
}

export default function Home() {
  return (
    <CartProvider>
      <BanhMiApp />
    </CartProvider>
  )
}
