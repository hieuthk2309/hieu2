import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// "confirmed" orders for tomorrow = orders placed for tomorrow with status "confirmed"
// In this system, orders are placed by date — we look at orders created today that have status "confirmed"
// (these are pre-orders / orders awaiting fulfillment tomorrow)
// We filter by orders whose created_at is for the NEXT calendar day (tomorrow)

export async function GET() {
  try {
    const now = new Date()

    // Tomorrow's date range
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0)
    const endOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59, 999)

    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, customer_name, total, status, created_at')
      .gte('created_at', tomorrow.toISOString())
      .lte('created_at', endOfTomorrow.toISOString())
      .eq('status', 'confirmed')
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)

    const confirmedOrders = orders || []

    // Group by customer name
    const customerMap = new Map<string, { count: number; total: number; latestAt: string }>()
    for (const order of confirmedOrders) {
      const existing = customerMap.get(order.customer_name)
      if (existing) {
        existing.count += 1
        existing.total += order.total
        existing.latestAt = order.created_at
      } else {
        customerMap.set(order.customer_name, {
          count: 1,
          total: order.total,
          latestAt: order.created_at,
        })
      }
    }

    const customers = Array.from(customerMap.entries()).map(([name, data]) => ({
      name,
      orderCount: data.count,
      total: data.total,
      latestAt: data.latestAt,
    }))

    return NextResponse.json({
      totalConfirmedOrders: confirmedOrders.length,
      totalCustomers: customers.length,
      customers,
    })
  } catch (error: any) {
    console.error('Error fetching tomorrow confirmed orders:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra: ' + (error?.message || String(error)) },
      { status: 500 }
    )
  }
}
