'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { CartItem, MenuItem, Topping } from './types'

interface CartContextType {
  items: CartItem[]
  addItem: (menuItem: MenuItem, toppings: Topping[], notes?: string) => void
  removeItem: (index: number) => void
  updateQuantity: (index: number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (menuItem: MenuItem, toppings: Topping[], notes?: string) => {
    setItems((prev) => [
      ...prev,
      {
        menuItem,
        quantity: 1,
        selectedToppings: toppings,
        notes,
      },
    ])
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index)
      return
    }
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const totalPrice = items.reduce((sum, item) => {
    const itemPrice =
      item.menuItem.price +
      item.selectedToppings.reduce((t, topping) => t + topping.price, 0)
    return sum + itemPrice * item.quantity
  }, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
