import { NextRequest, NextResponse } from 'next/server'
import { createOrder, createOrderItems, getAllOrders } from '@/lib/db'
import { getCleanUserOrders, setUserOrdersCookie, getTodayString, UserCookieOrder } from '@/lib/order-cookies'
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
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
})

// POST - Create pre-orders for selected dates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = OrderSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { customerName, total, items, dates: inputDates } = validationResult.data
    const todayStr = getTodayString()
    const targetDates = inputDates && inputDates.length > 0 ? inputDates : [todayStr]

    // Lấy và dọn dẹp các đơn hàng hiện có của thiết bị từ cookie
    const { activeOrders } = await getCleanUserOrders(request)
    const existingDates = activeOrders.map(o => o.date)

    // Kiểm tra xem ngày chọn có hợp lệ không (không ở quá khứ, không trùng, không vào Thứ 7/CN)
    for (const targetDate of targetDates) {
      if (targetDate < todayStr) {
        return NextResponse.json(
          { error: `Không thể đặt hàng trước cho ngày trong quá khứ (${targetDate})` },
          { status: 400 }
        )
      }
      const [year, month, day] = targetDate.split('-').map(Number)
      const targetObj = new Date(year, month - 1, day)
      const dayOfWeek = targetObj.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return NextResponse.json(
          { error: `Không nhận đơn hàng vào Thứ 7 và Chủ Nhật (${targetDate})` },
          { status: 400 }
        )
      }
      if (existingDates.includes(targetDate)) {
        return NextResponse.json(
          { error: `Ngày ${targetDate} bạn đã có 1 đơn hàng rồi. Nếu muốn đặt lại, vui lòng hủy đơn hàng cũ của ngày này!` },
          { status: 429 }
        )
      }
    }

    const createdOrderIds: number[] = []
    const newCookieEntries: UserCookieOrder[] = []

    // Tạo các đơn hàng riêng biệt cho từng ngày được chọn
    for (const targetDate of targetDates) {
      const createdAtISO = `${targetDate}T08:00:00.000Z`
      const orderId = await createOrder(customerName, total, createdAtISO)
      await createOrderItems(orderId, items)

      createdOrderIds.push(orderId)
      newCookieEntries.push({ id: orderId, date: targetDate })
    }

    const updatedOrders = [...activeOrders, ...newCookieEntries]

    const response = NextResponse.json(
      {
        success: true,
        message: `Đặt hàng trước thành công cho ${createdOrderIds.length} ngày!`,
        orderIds: createdOrderIds,
        orderId: createdOrderIds[0], // Tương thích ngược
      },
      { status: 201 }
    )

    // Cập nhật cookie thiết bị với danh sách đơn hàng đã đặt
    setUserOrdersCookie(response, updatedOrders)

    return response
  } catch (error: any) {
    console.error('Error creating pre-orders:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi đặt hàng trước: ' + (error?.message || String(error)) },
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
