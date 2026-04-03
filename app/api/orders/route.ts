import { NextRequest, NextResponse } from 'next/server'
import { createOrder, createOrderItems, getAllOrders, getOrderById } from '@/lib/db'
import { z } from 'zod'

// Validation schema for order
const OrderItemSchema = z.object({
  menuItemId: z.string(),
  menuItemName: z.string(),
  menuItemPrice: z.number(),
  quantity: z.number().min(1),
  toppings: z.array(z.string()),
  notes: z.string().optional(),
  subtotal: z.number(),
})

const OrderSchema = z.object({
  customerName: z.string().min(1, 'Vui lòng nhập họ tên'),
  total: z.number(),
  items: z.array(OrderItemSchema).min(1, 'Giỏ hàng trống'),
})

// Helper function to get today's date string (YYYY-MM-DD)
function getTodayString(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    // Check if user already ordered today
    const lastOrderDate = request.cookies.get('last_order_date')?.value
    const lastOrderId = request.cookies.get('last_order_id')?.value
    const today = getTodayString()

    if (lastOrderDate === today) {
      let hasRealOrder = true
      if (lastOrderId) {
        const orderExists = await getOrderById(parseInt(lastOrderId, 10))
        if (!orderExists) hasRealOrder = false
      }
      
      if (hasRealOrder) {
        return NextResponse.json(
          { error: 'Bạn đã đặt hàng hôm nay rồi. Vui lòng quay lại vào ngày mai!' },
          { status: 429 }
        )
      }
    }

    const body = await request.json()

    // Validate input
    const validationResult = OrderSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { customerName, total, items } = validationResult.data

    // Create order
    const orderId = await createOrder(customerName, total)

    // Create order items
    await createOrderItems(orderId, items)

    // Create response with cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Đặt hàng thành công!',
        orderId
      },
      { status: 201 }
    )

    // Set cookie to expire at midnight tonight
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    response.cookies.set('last_order_date', today, {
      expires: tomorrow,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    })

    response.cookies.set('last_order_id', String(orderId), {
      expires: tomorrow,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi đặt hàng: ' + (error?.message || String(error)) },
      { status: 500 }
    )
  }
}

// GET - Get all orders
export async function GET() {
  try {
    const orders = await getAllOrders()
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi lấy danh sách đơn hàng' },
      { status: 500 }
    )
  }
}
