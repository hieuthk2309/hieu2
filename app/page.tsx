'use client'

import { useState } from 'react'
import { CartProvider } from '@/lib/cart-context'
import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { MenuSection } from '@/components/menu-section'
import { CartSidebar } from '@/components/cart-sidebar'
import { CheckoutDialog } from '@/components/checkout-dialog'
import { Footer } from '@/components/footer'

function BanhMiApp() {
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const handleCheckout = () => {
    setCartOpen(false)
    setCheckoutOpen(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onCartClick={() => setCartOpen(true)} />
      
      <main className="flex-1">
        <HeroSection />
        <MenuSection />
      </main>

      <Footer />

      <CartSidebar
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />

      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
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
