import { NextRequest, NextResponse } from 'next/server'
import { getOrderById } from '@/lib/db'

// Helper function to get today's date string (YYYY-MM-DD)
export function getTodayString(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

// GET - Check if user can order today
export async function GET(request: NextRequest) {
  const lastOrderDate = request.cookies.get('last_order_date')?.value
  const lastOrderId = request.cookies.get('last_order_id')?.value
  const today = getTodayString()

  let canOrder = lastOrderDate !== today

  // Nếu cookie báo đã đặt, nhưng DB bị reset mất đơn -> Cho phép đặt lại
  if (!canOrder && lastOrderId) {
    const orderExists = await getOrderById(parseInt(lastOrderId, 10))
    if (!orderExists) canOrder = true
  }

  return NextResponse.json({
    canOrder,
    lastOrderDate: lastOrderDate || null,
    lastOrderId: lastOrderId || null,
    message: canOrder
      ? 'Ban co the dat hang'
      : 'Ban da dat hang hom nay roi. Vui long quay lai vao ngay mai nhe!'
  })
}
