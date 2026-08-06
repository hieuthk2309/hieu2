import { NextRequest, NextResponse } from 'next/server'
import { getCleanUserOrders, setUserOrdersCookie, getTodayString } from '@/lib/order-cookies'

export async function GET(request: NextRequest) {
  try {
    const { activeOrders } = await getCleanUserOrders(request)
    const todayStr = getTodayString()

    const orderedDates = activeOrders.map(o => o.date)
    const isTodayOrdered = orderedDates.includes(todayStr)
    const lastOrder = activeOrders.length > 0 ? activeOrders[activeOrders.length - 1] : null

    const response = NextResponse.json({
      canOrderToday: !isTodayOrdered,
      canOrder: !isTodayOrdered, // Giữ lại tương thích
      orderedDates,
      activeOrders,
      lastOrderId: lastOrder ? lastOrder.id : null,
      lastOrderDate: lastOrder ? lastOrder.date : null,
      message: isTodayOrdered
        ? 'Bạn đã đặt đơn hàng cho ngày hôm nay rồi!'
        : 'Bạn có thể đặt hàng trước cho các ngày khả dụng.',
    })

    // Lưu cookie đã được làm mới (xóa ngày quá khứ / đơn đã bị hủy)
    setUserOrdersCookie(response, activeOrders)

    return response
  } catch (error: any) {
    console.error('Error checking user orders:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi kiểm tra danh sách đơn hàng' },
      { status: 500 }
    )
  }
}
