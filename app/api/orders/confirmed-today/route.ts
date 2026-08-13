import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Only "completed" orders count for today's golden board
const CONFIRMED_STATUSES = ['completed']

export async function GET() {
  try {
    // Get today's date range (Vietnam timezone offset +7)
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, customer_name, total, status, created_at')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())
      .in('status', CONFIRMED_STATUSES)
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)

    const confirmedOrders = orders || []

    // Group by customer name, count orders and sum total
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
    console.error('Error fetching confirmed orders:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra: ' + (error?.message || String(error)) },
      { status: 500 }
    )
  }
}
