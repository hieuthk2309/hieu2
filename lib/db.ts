import { supabase } from './supabase'

export interface OrderRow {
  id: number
  customer_name: string
  total: number
  status: string
  created_at: string
}

export interface OrderItemRow {
  id: number
  order_id: number
  menu_item_id: string
  menu_item_name: string
  menu_item_price: number
  quantity: number
  toppings: string | null
  notes: string | null
  subtotal: number
}

// Insert a new order
export async function createOrder(
  customerName: string,
  total: number
): Promise<number> {
  const { data, error } = await supabase
    .from('orders')
    .insert([{ customer_name: customerName, total }])
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(`Failed to create order: ${error?.message}`)
  }

  return data.id
}

// Insert order items
export async function createOrderItems(
  orderId: number,
  items: {
    menuItemId: string
    menuItemName: string
    menuItemPrice: number
    quantity: number
    toppings: string[]
    notes?: string
    subtotal: number
  }[]
): Promise<void> {
  const orderItemsInsert = items.map(item => ({
    order_id: orderId,
    menu_item_id: item.menuItemId,
    menu_item_name: item.menuItemName,
    menu_item_price: item.menuItemPrice,
    quantity: item.quantity,
    toppings: item.toppings, // Mặc định Supabase JSONB sẽ tự xử lý mảng
    notes: item.notes || null,
    subtotal: item.subtotal
  }))

  const { error } = await supabase
    .from('order_items')
    .insert(orderItemsInsert)

  if (error) {
    throw new Error(`Failed to create order items: ${error.message}`)
  }
}

// Get all orders
export async function getAllOrders(): Promise<OrderRow[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

// Get order by ID with items
export async function getOrderById(id: number): Promise<{ order: OrderRow; items: OrderItemRow[] } | null> {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (orderError || !order) return null

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id)

  if (itemsError) throw new Error(itemsError.message)

  // Đảm bảo tương thích ngược: toppings luôn trả về kiểu stringified JSON giống SQLite db.ts cũ
  const formattedItems = (items || []).map(item => ({
    ...item,
    toppings: typeof item.toppings === 'string' ? item.toppings : JSON.stringify(item.toppings || [])
  }))

  return { order, items: formattedItems }
}

// Update order status
export async function updateOrderStatus(id: number, status: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

// Get orders by status
export async function getOrdersByStatus(status: string): Promise<OrderRow[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}
