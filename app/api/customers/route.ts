import { NextRequest, NextResponse } from 'next/server'
import { getAllCustomers, createCustomer } from '@/lib/customers-db'

export async function GET() {
  try {
    const customers = await getAllCustomers()
    const totalDebt = customers.reduce((sum, c) => sum + (c.debt || 0), 0)

    return NextResponse.json({
      customers,
      totalCount: customers.length,
      totalDebt,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Có lỗi xảy ra khi lấy danh sách khách hàng' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, debt, phone, notes } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Vui lòng nhập tên khách hàng' },
        { status: 400 }
      )
    }

    const initialDebt = debt !== undefined && debt !== null ? Number(debt) : 0
    const customer = await createCustomer(name, initialDebt, phone, notes)

    return NextResponse.json({
      success: true,
      customer,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Không thể tạo khách hàng' },
      { status: 500 }
    )
  }
}
