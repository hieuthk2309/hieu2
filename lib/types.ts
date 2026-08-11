export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: 'classic' | 'special' | 'vegetarian' | 'drink'
  popular?: boolean
}

export interface Topping {
  id: string
  name: string
  price: number
}

export interface CartItem {
  menuItem: MenuItem
  quantity: number
  selectedToppings: Topping[]
  notes?: string
}

export interface Order {
  items: CartItem[]
  customerName: string
  phone: string
  address: string
  paymentMethod: 'cash' | 'transfer'
  total: number
}
