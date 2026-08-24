import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { foodItems, drinkItems } from '@/lib/menu-data'

export async function GET(request: NextRequest) {
  try {
    // 1. Fetch all orders and items from Supabase
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: true })

    if (ordersError) {
      throw new Error(`Failed to fetch orders: ${ordersError.message}`)
    }

    const orderList = orders || []
    const orderIds = orderList.map((o) => o.id)

    let itemsList: any[] = []
    if (orderIds.length > 0) {
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds)

      if (itemsError) {
        throw new Error(`Failed to fetch order items: ${itemsError.message}`)
      }
      itemsList = items || []
    }

    // Map items to orders
    const itemsByOrderId = new Map<number, any[]>()
    for (const item of itemsList) {
      const existing = itemsByOrderId.get(item.order_id) || []
      existing.push(item)
      itemsByOrderId.set(item.order_id, existing)
    }

    // Helper: is drink or food
    const isDrinkItem = (item: any) => {
      if (drinkItems.some((d) => String(d.id) === String(item.menu_item_id))) return true
      const name = (item.menu_item_name || '').toLowerCase()
      return name.includes('trà') || name.includes('cà phê') || name.includes('nước') || name.includes('sữa')
    }

    // ── 2. Calculate 10-Day Trend ──
    const now = new Date()
    const last10Days: { key: string; day: string; date: string; fullDate: string }[] = []
    for (let i = 9; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const key = `${year}-${month}-${day}`
      const dayIndex = 10 - i
      last10Days.push({
        key,
        day: `Ngày ${dayIndex}`,
        date: `${day}/${month}`,
        fullDate: d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }),
      })
    }

    // Group orders by date (YYYY-MM-DD in local time)
    const ordersByDate = new Map<string, { totalOrders: number; foodOrders: number; drinkOrders: number }>()
    for (const d of last10Days) {
      ordersByDate.set(d.key, { totalOrders: 0, foodOrders: 0, drinkOrders: 0 })
    }

    for (const ord of orderList) {
      const orderDate = new Date(ord.created_at)
      const y = orderDate.getFullYear()
      const m = String(orderDate.getMonth() + 1).padStart(2, '0')
      const day = String(orderDate.getDate()).padStart(2, '0')
      const dateKey = `${y}-${m}-${day}`

      if (ordersByDate.has(dateKey)) {
        const current = ordersByDate.get(dateKey)!
        current.totalOrders += 1
        const orderItems = itemsByOrderId.get(ord.id) || []
        const hasFood = orderItems.some((it) => !isDrinkItem(it))
        const hasDrink = orderItems.some((it) => isDrinkItem(it))
        if (hasFood) current.foodOrders += 1
        if (hasDrink) current.drinkOrders += 1
      }
    }

    const ordersTrend10Days = last10Days.map((d, index) => {
      const data = ordersByDate.get(d.key) || { totalOrders: 0, foodOrders: 0, drinkOrders: 0 }
      let growthRate = 0
      if (index > 0) {
        const prevKey = last10Days[index - 1].key
        const prevOrders = ordersByDate.get(prevKey)?.totalOrders || 0
        if (prevOrders > 0) {
          growthRate = Number((((data.totalOrders - prevOrders) / prevOrders) * 100).toFixed(1))
        } else if (data.totalOrders > 0) {
          growthRate = 100
        }
      }
      return {
        day: d.day,
        date: d.date,
        fullDate: d.fullDate,
        orders: data.totalOrders,
        foodOrders: data.foodOrders,
        drinkOrders: data.drinkOrders,
        growthRate,
      }
    })

    // ── 3. Calculate Weekly Revenue (7 days: Thứ 2 -> Chủ Nhật) ──
    const weekDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật']
    const weeklyDataMap = new Map<number, { foodRevenue: number; drinksRevenue: number }>()
    for (let i = 0; i < 7; i++) {
      weeklyDataMap.set(i, { foodRevenue: 0, drinksRevenue: 0 })
    }

    // ── 4. Calculate Monthly Revenue (12 months) ──
    const monthlyDataMap = new Map<number, { foodRevenue: number; drinksRevenue: number }>()
    for (let i = 0; i < 12; i++) {
      monthlyDataMap.set(i, { foodRevenue: 0, drinksRevenue: 0 })
    }

    // ── 5. Product Sales Aggregation ──
    const productStats = new Map<
      string,
      { name: string; category: 'food' | 'drink'; soldQuantity: number; revenue: number }
    >()

    let totalRevenue = 0
    let totalFoodRevenue = 0
    let totalDrinksRevenue = 0
    let validOrdersCount = 0

    for (const ord of orderList) {
      if (ord.status === 'cancelled') continue

      validOrdersCount += 1
      totalRevenue += Number(ord.total || 0)

      const orderDate = new Date(ord.created_at)
      // JS getDay(): 0 is Sunday, 1 is Monday...
      // Map to 0: Mon, 1: Tue ... 6: Sun
      const jsDay = orderDate.getDay()
      const dayIndex = jsDay === 0 ? 6 : jsDay - 1
      const monthIndex = orderDate.getMonth()

      const orderItems = itemsByOrderId.get(ord.id) || []
      let orderFoodRev = 0
      let orderDrinkRev = 0

      for (const it of orderItems) {
        const subtotal = Number(it.subtotal || 0)
        const isDrink = isDrinkItem(it)
        if (isDrink) {
          orderDrinkRev += subtotal
          totalDrinksRevenue += subtotal
        } else {
          orderFoodRev += subtotal
          totalFoodRevenue += subtotal
        }

        // Aggregate product stats
        const key = it.menu_item_id || it.menu_item_name
        const existing = productStats.get(key) || {
          name: it.menu_item_name,
          category: isDrink ? ('drink' as const) : ('food' as const),
          soldQuantity: 0,
          revenue: 0,
        }
        existing.soldQuantity += Number(it.quantity || 1)
        existing.revenue += subtotal
        productStats.set(key, existing)
      }

      // If items didn't add up to total (e.g. legacy orders without items), distribute remaining
      const sumItems = orderFoodRev + orderDrinkRev
      if (sumItems === 0 && ord.total > 0) {
        orderFoodRev = Number(ord.total)
        totalFoodRevenue += Number(ord.total)
      }

      // Add to weekly
      const weekEntry = weeklyDataMap.get(dayIndex)!
      weekEntry.foodRevenue += orderFoodRev
      weekEntry.drinksRevenue += orderDrinkRev

      // Add to monthly
      const monthEntry = monthlyDataMap.get(monthIndex)!
      monthEntry.foodRevenue += orderFoodRev
      monthEntry.drinksRevenue += orderDrinkRev
    }

    const revenueWeekly = weekDays.map((period, idx) => {
      const entry = weeklyDataMap.get(idx)!
      return {
        period,
        fullLabel: period,
        foodRevenue: entry.foodRevenue,
        drinksRevenue: entry.drinksRevenue,
        totalRevenue: entry.foodRevenue + entry.drinksRevenue,
      }
    })

    const revenueMonthly = Array.from({ length: 12 }, (_, i) => {
      const entry = monthlyDataMap.get(i)!
      return {
        period: `Th${i + 1}`,
        fullLabel: `Tháng ${i + 1}`,
        foodRevenue: entry.foodRevenue,
        drinksRevenue: entry.drinksRevenue,
        totalRevenue: entry.foodRevenue + entry.drinksRevenue,
      }
    })

    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.soldQuantity - a.soldQuantity)
      .slice(0, 5)
      .map((p, idx) => ({
        id: String(idx + 1),
        name: p.name,
        category: p.category,
        soldQuantity: p.soldQuantity,
        revenue: p.revenue,
        trend: 'up' as const,
        growth: 10 + (5 - idx) * 2.5,
      }))

    const avgOrderValue = validOrdersCount > 0 ? Math.round(totalRevenue / validOrdersCount) : 0

    return NextResponse.json({
      success: true,
      summary: {
        totalOrders: validOrdersCount,
        allOrdersCount: orderList.length,
        totalRevenue,
        totalFoodRevenue,
        totalDrinksRevenue,
        averageOrderValue: avgOrderValue,
      },
      ordersTrend10Days,
      revenueWeekly,
      revenueMonthly,
      topProducts,
    })
  } catch (error: any) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Lỗi khi lấy dữ liệu thống kê: ' + (error?.message || String(error)) },
      { status: 500 }
    )
  }
}
