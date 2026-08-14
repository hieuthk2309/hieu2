'use client'

import { useState } from 'react'
import { CartProvider } from '@/lib/cart-context'
import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { BanhMiComboLanding } from '@/components/banh-mi-combo-landing'
import { MenuSection } from '@/components/menu-section'
import { CartSidebar } from '@/components/cart-sidebar'
import { CheckoutDialog, type BuyNowItem } from '@/components/checkout-dialog'
import { DebtSearchSection } from '@/components/debt-search-section'
import { GoldenBoard } from '@/components/golden-board'
import { Footer } from '@/components/footer'
import { ChatBot } from '@/components/chatbot'
import type { MenuItem, Topping } from '@/lib/types'
import { UtensilsCrossed, Trophy, Search } from 'lucide-react'

type Tab = 'menu' | 'golden' | 'debt'

const TABS: { id: Tab; label: string; icon: React.ReactNode; emoji: string }[] = [
  { id: 'menu',   label: 'Thực Đơn',     icon: <UtensilsCrossed className="w-4 h-4" />, emoji: '🥖' },
  { id: 'golden', label: 'Bảng Vàng',    icon: <Trophy className="w-4 h-4" />,          emoji: '🏆' },
  { id: 'debt',   label: 'Công Nợ',      icon: <Search className="w-4 h-4" />,          emoji: '🔍' },
]

function BanhMiApp() {
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [buyNowItem, setBuyNowItem] = useState<BuyNowItem | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('menu')

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
        <BanhMiComboLanding
          bannerSrc="/banner_combo.png"
          comboStartingPrice="35.000đ"
          freeshipCode="FREESHIPCOMBO"
          onOrderClick={() => {
            setActiveTab('menu')
            const menuEl = document.getElementById('menu')
            if (menuEl) {
              menuEl.scrollIntoView({ behavior: 'smooth' })
            }
          }}
        />

        {/* ── Tab Bar ── */}
        <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
          <div className="container mx-auto px-4 py-2.5">
            <nav
              className="flex items-center gap-1 bg-muted/60 rounded-xl p-1 w-fit mx-auto shadow-inner"
              aria-label="Điều hướng chính"
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    aria-selected={isActive}
                    className={[
                      'relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 outline-none select-none whitespace-nowrap',
                      isActive
                        ? 'bg-background text-primary shadow-sm ring-1 ring-border/40'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                    ].join(' ')}
                  >
                    <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                      {isActive
                        ? <span className="text-sm leading-none">{tab.emoji}</span>
                        : tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div>
          {activeTab === 'menu'   && <MenuSection onBuyNow={handleBuyNow} />}
          {activeTab === 'golden' && <GoldenBoard />}
          {activeTab === 'debt'   && <DebtSearchSection />}
        </div>
      </main>

      <Footer />

      {/* Chatbot floating */}
      <ChatBot />

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
