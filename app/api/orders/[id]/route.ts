import { NextRequest, NextResponse } from 'next/server'
import {
  getOrderById,
  updateOrderStatus,
  updateOrderItemNote,
  updateOrderCustomerInfo,
  deleteOrder,
} from '@/lib/db'
import { z } from 'zod'

// GET - Get order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orderId = parseInt(id, 10)

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'ID đơn hàng không hợp lệ' },
        { status: 400 }
      )
    }

    const result = await getOrderById(orderId)

    if (!result) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi lấy thông tin đơn hàng' },
      { status: 500 }
    )
  }
}

// PATCH - Update order status, order item note, OR customer info (strictly customer_name & created_at only)
const UpdateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled']),
})

const UpdateItemNoteSchema = z.object({
  itemId: z.number(),
  notes: z.string(),
})

const UpdateOrderInfoSchema = z.object({
  customer_name: z.string().min(1, 'Tên khách hàng không được để trống').optional(),
  created_at: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orderId = parseInt(id, 10)

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'ID đơn hàng không hợp lệ' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // 1. Handle item note update
    const noteValidation = UpdateItemNoteSchema.safeParse(body)
    if (noteValidation.success) {
      const { itemId, notes } = noteValidation.data
      await updateOrderItemNote(itemId, notes)
      return NextResponse.json({
        success: true,
        message: 'Cập nhật ghi chú thành công',
      })
    }

    // 2. Handle order customer info update (Chỉ được sửa tên khách hàng và ngày đặt)
    if (body.customer_name !== undefined || body.created_at !== undefined) {
      const infoValidation = UpdateOrderInfoSchema.safeParse(body)
      if (!infoValidation.success) {
        return NextResponse.json(
          { error: infoValidation.error.errors[0]?.message || 'Dữ liệu chỉnh sửa không hợp lệ' },
          { status: 400 }
        )
      }

      const existingOrder = await getOrderById(orderId)
      if (!existingOrder) {
        return NextResponse.json(
          { error: 'Không tìm thấy đơn hàng' },
          { status: 404 }
        )
      }

      await updateOrderCustomerInfo(orderId, {
        customer_name: infoValidation.data.customer_name,
        created_at: infoValidation.data.created_at,
      })

      return NextResponse.json({
        success: true,
        message: 'Cập nhật thông tin đơn hàng thành công',
      })
    }

    // 3. Handle status update
    const statusValidation = UpdateStatusSchema.safeParse(body)
    if (!statusValidation.success) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ' },
        { status: 400 }
      )
    }

    const existingOrder = await getOrderById(orderId)
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      )
    }

    const newStatus = statusValidation.data.status
    await updateOrderStatus(orderId, newStatus)

    const response = NextResponse.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
    })

    // Nếu đơn hàng bị hủy -> Xóa đơn khỏi cookie để giải phóng ngày đã chọn cho thiết bị
    if (newStatus === 'cancelled') {
      const { parseUserOrdersCookie, setUserOrdersCookie } = await import('@/lib/order-cookies')
      const currentOrders = parseUserOrdersCookie(request)
      const remainingOrders = currentOrders.filter(o => o.id !== orderId)
      setUserOrdersCookie(response, remainingOrders)
    }

    return response
  } catch (error: any) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: error?.message || 'Có lỗi xảy ra khi cập nhật đơn hàng' },
      { status: 500 }
    )
  }
}

// DELETE - Delete order and its items
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orderId = parseInt(id, 10)

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'ID đơn hàng không hợp lệ' },
        { status: 400 }
      )
    }

    const existingOrder = await getOrderById(orderId)
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      )
    }

    await deleteOrder(orderId)

    const response = NextResponse.json({
      success: true,
      message: `Đã xóa đơn hàng #${orderId} thành công`,
    })

    // Xóa đơn khỏi cookie của người dùng nếu có
    const { parseUserOrdersCookie, setUserOrdersCookie } = await import('@/lib/order-cookies')
    const currentOrders = parseUserOrdersCookie(request)
    const remainingOrders = currentOrders.filter(o => o.id !== orderId)
    setUserOrdersCookie(response, remainingOrders)

    return response
  } catch (error: any) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: error?.message || 'Có lỗi xảy ra khi xóa đơn hàng' },
      { status: 500 }
    )
  }
}

