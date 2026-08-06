import { NextRequest, NextResponse } from 'next/server'
import { getOrderById } from './db'

export interface UserCookieOrder {
  id: number
  date: string // YYYY-MM-DD
}

export function getTodayString(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

export function parseUserOrdersCookie(request: NextRequest): UserCookieOrder[] {
  try {
    const raw = request.cookies.get('user_orders')?.value
    if (!raw) {
      // Tương thích ngược với cookie cũ
      const oldId = request.cookies.get('last_order_id')?.value
      const oldDate = request.cookies.get('last_order_date')?.value
      if (oldId && oldDate) {
        return [{ id: parseInt(oldId, 10), date: oldDate }]
      }
      return []
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.filter(item => item && typeof item.id === 'number' && typeof item.date === 'string')
    }
    return []
  } catch {
    return []
  }
}

export async function getCleanUserOrders(request: NextRequest): Promise<{
  activeOrders: UserCookieOrder[]
  cleanCookieJson: string
}> {
  const rawOrders = parseUserOrdersCookie(request)
  const todayStr = getTodayString()

  const validOrders: UserCookieOrder[] = []

  for (const orderItem of rawOrders) {
    // Tự động xóa khỏi cookie nếu ngày đơn hàng đã ở trong quá khứ (< ngày hôm nay)
    if (orderItem.date < todayStr) {
      continue
    }

    // Kiểm tra trong DB: nếu đơn bị hủy -> xóa khỏi active cookie
    try {
      const dbOrder = await getOrderById(orderItem.id)
      if (dbOrder && dbOrder.order.status !== 'cancelled') {
        validOrders.push(orderItem)
      }
    } catch {
      validOrders.push(orderItem)
    }
  }

  return {
    activeOrders: validOrders,
    cleanCookieJson: JSON.stringify(validOrders),
  }
}

export function setUserOrdersCookie(response: NextResponse, orders: UserCookieOrder[]) {
  const expires = new Date()
  expires.setDate(expires.getDate() + 30)

  response.cookies.set('user_orders', JSON.stringify(orders), {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  })

  if (orders.length > 0) {
    const latest = orders[orders.length - 1]
    response.cookies.set('last_order_date', latest.date, { expires, httpOnly: true, path: '/' })
    response.cookies.set('last_order_id', String(latest.id), { expires, httpOnly: true, path: '/' })
  } else {
    response.cookies.delete('last_order_date')
    response.cookies.delete('last_order_id')
  }
}
