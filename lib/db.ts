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
  total: number,
  createdAt?: string
): Promise<number> {
  const insertData: { customer_name: string; total: number; created_at?: string } = {
    customer_name: customerName,
    total,
  }
  if (createdAt) {
    insertData.created_at = createdAt
  }

  const { data, error } = await supabase
    .from('orders')
    .insert([insertData])
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

// Update notes for a specific order item
export async function updateOrderItemNote(itemId: number, notes: string): Promise<void> {
  const { error } = await supabase
    .from('order_items')
    .update({ notes })
    .eq('id', itemId)

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

// Get orders by date (YYYY-MM-DD) with their items
export async function getOrdersByDateWithItems(dateStr?: string): Promise<{ order: OrderRow; items: OrderItemRow[] }[]> {
  let startOfDay: Date
  let endOfDay: Date

  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number)
    startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0)
    endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999)
  } else {
    startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)
  }

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', startOfDay.toISOString())
    .lte('created_at', endOfDay.toISOString())
    .order('created_at', { ascending: false })

  if (ordersError) throw new Error(ordersError.message)
  if (!orders || orders.length === 0) return []

  const orderIds = orders.map(o => o.id)
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds)

  if (itemsError) throw new Error(itemsError.message)

  const formattedItems = (items || []).map(item => ({
    ...item,
    toppings: typeof item.toppings === 'string' ? item.toppings : JSON.stringify(item.toppings || [])
  }))

  return orders.map(order => ({
    order,
    items: formattedItems.filter(item => item.order_id === order.id)
  }))
}

// Get all orders created today with their items
export async function getTodayOrdersWithItems(): Promise<{ order: OrderRow; items: OrderItemRow[] }[]> {
  return getOrdersByDateWithItems()
}

// Update order info (strictly customer_name and created_at only)
export async function updateOrderCustomerInfo(
  id: number,
  data: { customer_name?: string; created_at?: string }
): Promise<void> {
  const updatePayload: { customer_name?: string; created_at?: string } = {}

  if (typeof data.customer_name === 'string' && data.customer_name.trim()) {
    updatePayload.customer_name = data.customer_name.trim()
  }

  if (data.created_at) {
    updatePayload.created_at = data.created_at
  }

  if (Object.keys(updatePayload).length === 0) {
    return
  }

  const { error } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', id)

  if (error) throw new Error(`Lỗi cập nhật đơn hàng: ${error.message}`)
}

// Delete an order and its related items
export async function deleteOrder(id: number): Promise<void> {
  // First delete associated order items
  const { error: itemsError } = await supabase
    .from('order_items')
    .delete()
    .eq('order_id', id)

  if (itemsError) {
    throw new Error(`Lỗi khi xóa các món trong đơn hàng: ${itemsError.message}`)
  }

  // Then delete the order itself
  const { error: orderError } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)

  if (orderError) {
    throw new Error(`Lỗi khi xóa đơn hàng: ${orderError.message}`)
  }
}


