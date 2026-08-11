import { NextRequest, NextResponse } from 'next/server'
import { updateCustomerDebt, deleteCustomer } from '@/lib/customers-db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { debt, notes } = body

    if (debt === undefined || debt === null || isNaN(Number(debt))) {
      return NextResponse.json(
        { error: 'Số tiền công nợ không hợp lệ' },
        { status: 400 }
      )
    }

    const updated = await updateCustomerDebt(id, Number(debt), notes)

    return NextResponse.json({
      success: true,
      customer: updated,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Cập nhật công nợ thất bại' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteCustomer(id)

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Xóa khách hàng thất bại' },
      { status: 500 }
    )
  }
}
