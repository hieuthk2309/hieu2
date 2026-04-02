import { NextRequest, NextResponse } from 'next/server'
import { getOrderById, updateOrderStatus } from '@/lib/db'
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

// PATCH - Update order status
const UpdateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled']),
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
    const validationResult = UpdateStatusSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Trạng thái không hợp lệ' },
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

    await updateOrderStatus(orderId, validationResult.data.status)

    return NextResponse.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi cập nhật đơn hàng' },
      { status: 500 }
    )
  }
}
