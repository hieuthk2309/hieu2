import { NextRequest, NextResponse } from 'next/server'
import { getOrdersByDateWithItems } from '@/lib/db'
import { foodItems, drinkItems } from '@/lib/menu-data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date') || undefined

    const ordersData = await getOrdersByDateWithItems(dateParam)

    let totalRevenue = 0
    let drinkRevenue = 0
    let foodRevenue = 0
    const statusCounts = {
      pending: 0,
      confirmed: 0,
      preparing: 0,
      delivering: 0,
      completed: 0,
      cancelled: 0,
    }

    const itemStatsMap = new Map<string, { quantity: number; revenue: number }>()
    const toppingStatsMap = new Map<string, number>()

    for (const { order, items } of ordersData) {
      if (order.status !== 'cancelled') {
        totalRevenue += order.total
      }

      if (order.status in statusCounts) {
        statusCounts[order.status as keyof typeof statusCounts] += 1
      }

      for (const item of items) {
        // Summarize item sales
        const existingItem = itemStatsMap.get(item.menu_item_name) || { quantity: 0, revenue: 0 }
        itemStatsMap.set(item.menu_item_name, {
          quantity: existingItem.quantity + item.quantity,
          revenue: existingItem.revenue + item.subtotal,
        })

        // Check if it's a drink
        if (drinkItems.some(drink => drink.id == item.menu_item_id)) {
          drinkRevenue += item.subtotal
        } else if (foodItems.some(food => food.id == item.menu_item_id)) {
          foodRevenue += item.subtotal
        }

        // Summarize toppings
        if (item.toppings) {
          try {
            const parsedToppings: string[] = JSON.parse(item.toppings)
            if (Array.isArray(parsedToppings)) {
              for (const topping of parsedToppings) {
                const count = toppingStatsMap.get(topping) || 0
                toppingStatsMap.set(topping, count + item.quantity)
              }
            }
          } catch {
            // Ignore JSON parse errors
          }
        }
      }
    }

    const topItems = Array.from(itemStatsMap.entries())
      .map(([name, stat]) => ({ name, quantity: stat.quantity, revenue: stat.revenue }))
      .sort((a, b) => b.quantity - a.quantity)

    const topToppings = Array.from(toppingStatsMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      orders: ordersData,
      summary: {
        totalOrders: ordersData.length,
        totalRevenue,
        foodRevenue,
        drinkRevenue,
        statusCounts,
        topItems,
        topToppings,
      },
    })
  } catch (error: any) {
    console.error("Error fetching orders by date:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy danh sách đơn hàng: " + (error?.message || String(error)) },
      { status: 500 }
    )
  }
}
