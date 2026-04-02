'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Clock, MapPin, Phone, User, CheckCircle2, Package, Receipt, CreditCard, ChevronLeft, Bike, Edit2, Check, X, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'


// Mô phỏng 1 đơn hàng duy nhất
export default function OrderPage() {
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [tempNote, setTempNote] = useState('')

  useEffect(() => {
    async function fetchOrder() {
      try {
        setIsLoading(true)
        const checkRes = await fetch('/api/orders/check')
        const checkData = await checkRes.json()
        
        if (checkData.canOrder || !checkData.lastOrderId) {
          setOrder(null)
          return
        }

        const orderRes = await fetch(`/api/orders/${checkData.lastOrderId}`)
        if (!orderRes.ok) throw new Error('Không thể tải đơn hàng')
        
        const data = await orderRes.json()
        
        const mappedOrder = {
          id: data.order.id,
          customerName: data.order.customer_name,
          total: data.order.total,
          status: data.order.status,
          createdAt: data.order.created_at,
          items: data.items.map((item: any) => ({
            id: item.id,
            menuItemName: item.menu_item_name,
            quantity: item.quantity,
            menuItemPrice: item.menu_item_price,
            toppings: item.toppings ? JSON.parse(item.toppings) : [],
            notes: item.notes,
            subtotal: item.subtotal
          }))
        }
        
        setOrder(mappedOrder)
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra')
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrder()
  }, [])

  const handleEditNote = (item: any) => {
    setEditingNoteId(item.id)
    setTempNote(item.notes || '')
  }

  const handleSaveNote = (itemId: string) => {
    setOrder((prev: any) => ({
      ...prev,
      items: prev.items.map((item: any) => item.id === itemId ? { ...item, notes: tempNote } : item)
    }))
    setEditingNoteId(null)
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString('vi-VN')
  }

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1 animate-pulse flex items-center gap-1.5 font-medium">
        <Bike className="w-3.5 h-3.5" /> Sẽ giao vào ngày mai
      </Badge>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 mt-6 max-w-3xl min-h-[calc(100vh-200px)]">
      <Link href="/">
        <Button variant="ghost" className="mb-6 -ml-4 flex gap-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" /> Quay lại trang chủ
        </Button>
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Receipt className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Chi Tiết Đơn Hàng</h1>
          <p className="text-muted-foreground mt-1 text-sm">Theo dõi tiến độ đơn hàng hôm nay của bạn</p>
        </div>
      </div>

      {isLoading ? (
        <Card className="flex flex-col items-center justify-center py-20 border border-border/50 shadow-sm opacity-80">
          <Loader2 className="w-10 h-10 animate-spin text-primary opacity-60 mb-4" />
          <p className="text-muted-foreground font-medium animate-pulse">Đang định vị đơn hàng của bạn...</p>
        </Card>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 flex gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      ) : !order ? (
        <Card className="flex flex-col items-center justify-center py-20 border border-border/50 shadow-sm text-center px-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">Bạn chưa đặt ổ bánh mì nào trong hôm nay. Hãy xem thực đơn và đặt ngay nhé!</p>
          <Link href="/">
            <Button>Xem thực đơn</Button>
          </Link>
        </Card>
      ) : (
        <Card className="border-border shadow-sm border-t-4 border-t-primary/60">
        <CardHeader className="bg-muted/10 border-b border-border py-4 px-6 md:px-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Receipt className="w-32 h-32" />
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2 mb-1">
                Đơn hàng #{order.id}
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5 text-sm">
                <Clock className="w-4 h-4" /> Đặt lúc: {formatTime(order.createdAt)}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              {getStatusBadge(order.status)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:px-8 bg-card">
          {/* Thông tin khách hàng */}
          <div className="mb-8 bg-muted/20 p-5 rounded-xl border border-border/50">
            <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3 flex items-center gap-2">
              Người đặt
            </h3>
            <div className="flex gap-3 text-sm">
              <User className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span className="font-medium text-foreground">{order.customerName}</span>
            </div>
          </div>

          {/* Chi tiết món ăn */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-4 pl-1 border-l-4 border-l-primary flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              Chi tiết món ăn
            </h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 rounded-xl border border-border bg-card">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                    {item.quantity}x
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h4 className="font-bold text-foreground text-base leading-tight">{item.menuItemName}</h4>
                      <span className="font-semibold text-foreground shrink-0">{formatPrice(item.subtotal)}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.toppings && item.toppings.length > 0 && (
                        <div className="bg-secondary px-2 py-1 rounded-md text-xs font-medium text-foreground">
                          + {item.toppings.join(', ')}
                        </div>
                      )}
                    </div>

                    {/* Chỉnh sửa Ghi chú */}
                    {editingNoteId === item.id ? (
                      <div className="mt-3 flex flex-col gap-2 bg-muted/30 p-2.5 rounded-lg border border-border flex items-start">
                        <Input 
                          value={tempNote}
                          onChange={(e) => setTempNote(e.target.value)}
                          placeholder="Nhập ghi chú cho món này..."
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end w-full">
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={handleCancelEdit}>
                            <X className="w-3.5 h-3.5 mr-1" /> Hủy
                          </Button>
                          <Button size="sm" className="h-7 text-xs" onClick={() => handleSaveNote(item.id)}>
                            <Check className="w-3.5 h-3.5 mr-1" /> Lưu
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 text-sm bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/50 flex gap-2 items-start justify-between group">
                        <div className="flex gap-2 items-start">
                          <span className="font-semibold shrink-0">Ghi chú:</span>
                          <i>{item.notes || 'Không có ghi chú'}</i>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-amber-800/60 hover:text-amber-900 hover:bg-amber-200/50 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleEditNote(item)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Tổng kết */}
          <div className="flex flex-col items-end gap-2 pr-2">
            <div className="flex justify-between w-[280px] text-sm text-muted-foreground">
              <span>Tạm tính</span>
              <span>{formatPrice(order.total)}</span>
            </div>

            <Separator className="w-[280px] my-2" />
            <div className="flex justify-between w-[280px] items-center">
              <span className="font-bold text-foreground text-lg">Tổng cộng</span>
              <span className="font-bold text-primary text-2xl">{formatPrice(order.total)}</span>
            </div>

            {/* Nút tác vụ */}
            <div className="w-[280px] mt-6">
              {(order.status === 'pending' || order.status === 'processing') && (
                <Button variant="destructive" className="w-full font-semibold">
                  Hủy đơn hàng
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  )
}

