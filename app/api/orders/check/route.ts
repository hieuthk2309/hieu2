import { NextRequest, NextResponse } from 'next/server'

// Helper function to get today's date string (YYYY-MM-DD)
function getTodayString(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

// GET - Check if user can order today
export async function GET(request: NextRequest) {
  const lastOrderDate = request.cookies.get('last_order_date')?.value
  const lastOrderId = request.cookies.get('last_order_id')?.value
  const today = getTodayString()

  const canOrder = lastOrderDate !== today

  return NextResponse.json({
    canOrder,
    lastOrderDate: lastOrderDate || null,
    lastOrderId: lastOrderId || null,
    message: canOrder
      ? 'Ban co the dat hang'
      : 'Ban da dat hang hom nay roi. Vui long quay lai vao ngay mai nhe!'
  })
}
