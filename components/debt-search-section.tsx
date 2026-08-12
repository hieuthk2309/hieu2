'use client'

import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Search,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  X,
  CreditCard,
  Building2,
  UserCheck
} from 'lucide-react'

interface Customer {
  id: string
  name: string
  debt: number
  phone?: string | null
  notes?: string | null
  created_at?: string
}

function removeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}

export function DebtSearchSection() {
  const [query, setQuery] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu công nợ:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  // Filter matching customers as user types or searches
  const filteredCustomers = useMemo(() => {
    const cleanQuery = removeAccents(query)
    if (!cleanQuery) return []
    return customers.filter((c) => {
      const cleanName = removeAccents(c.name)
      const cleanPhone = c.phone ? removeAccents(c.phone) : ''
      return cleanName.includes(cleanQuery) || cleanPhone.includes(cleanQuery)
    })
  }, [query, customers])

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSearched(true)
    if (filteredCustomers.length > 0) {
      setSelectedCustomer(filteredCustomers[0])
    } else {
      setSelectedCustomer(null)
    }
  }

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setQuery(customer.name)
    setSearched(true)
  }

  const handleClear = () => {
    setQuery('')
    setSearched(false)
    setSelectedCustomer(null)
  }

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  // VietQR config constants based on requirements
  const BANK_ID = 'CAKE'
  const ACCOUNT_NO = '0799132435'
  const ACCOUNT_NAME = 'LE QUANG HIEU'

  const getQrUrl = (amount: number, customerName: string) => {
    const addInfo = encodeURIComponent(`Thanh toan cong no ${customerName}`)
    const accName = encodeURIComponent(ACCOUNT_NAME)
    return `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${addInfo}&accountName=${accName}`
  }

  return (
    <section id="debt-search" className="py-12 bg-muted/40 border-y border-border/60">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <QrCode className="w-4 h-4" /> Tra Cứu & Thanh Toán QR
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Kiểm Tra Số Tiền & Quét Mã QR Thanh Toán
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Nhập tên của bạn để tra cứu nhanh số tiền còn nợ và chuyển khoản qua mã QR Ngân hàng tiện lợi.
          </p>
        </div>

        <Card className="shadow-lg border-primary/20 overflow-hidden bg-card">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="space-y-3">
              <label className="text-sm font-bold text-foreground block">
                Tên khách hàng:
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value)
                      setSearched(false)
                    }}
                    placeholder="Nhập tên của bạn (ví dụ: Hieudeptrai, Hieusanmay, Hieubanhmi)..."
                    className="pl-11 pr-10 py-6 text-base rounded-xl border-border bg-background"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={!query.trim() || isLoading}
                  className="w-full sm:w-auto px-8 py-6 text-base font-bold rounded-xl gap-2 shadow-md shrink-0"
                >
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  Tra Cứu
                </Button>
              </div>
            </form>

            {/* Matching suggestions list while typing */}
            {query.trim() && !searched && filteredCustomers.length > 0 && (
              <div className="border border-border/80 rounded-xl bg-background divide-y divide-border overflow-hidden shadow-xs">
                <div className="px-4 py-2 bg-muted/50 text-xs font-bold text-muted-foreground">
                  Gợi ý tên phù hợp ({filteredCustomers.length}):
                </div>
                {filteredCustomers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCustomer(c)}
                    className="w-full px-4 py-3 text-left hover:bg-primary/5 flex items-center justify-between transition-colors"
                  >
                    <span className="font-bold text-foreground">{c.name}</span>
                    <Badge
                      variant={c.debt > 0 ? 'destructive' : 'outline'}
                      className="text-xs font-semibold"
                    >
                      {c.debt > 0 ? `Còn nợ: ${formatCurrency(c.debt)}` : 'Hết nợ'}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {/* Search Results Display */}
            {searched && (
              <div className="pt-2">
                {!selectedCustomer ? (
                  <div className="p-8 text-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 space-y-2">
                    <AlertCircle className="w-10 h-10 mx-auto text-amber-600 dark:text-amber-400" />
                    <h4 className="font-bold text-base">Không tìm thấy thông tin công nợ</h4>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Không tìm thấy tên &quot;{query}&quot; trong hệ thống công nợ. Vui lòng kiểm tra lại cách viết tên hoặc liên hệ chủ quán!
                    </p>
                  </div>
                ) : selectedCustomer.debt <= 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 space-y-3">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <h4 className="font-extrabold text-xl">Chào {selectedCustomer.name}!</h4>
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mt-1">
                        Bạn hiện không còn công nợ nào. Cảm ơn bạn rất nhiều! 🎉
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Customer Has Debt - Show Debt Amount & VietQR */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center rounded-2xl border border-primary/20 bg-card p-6 shadow-sm">
                    {/* Left Side: Debt Info */}
                    <div className="space-y-5">
                      <div className="space-y-1 border-b border-border pb-4">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Khách Hàng
                        </span>
                        <h3 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
                          <UserCheck className="w-6 h-6 text-primary" />
                          {selectedCustomer.name}
                        </h3>
                      </div>

                      <div className="space-y-1 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
                        <span className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                          Số Tiền Còn Nợ
                        </span>
                        <div className="text-3xl font-black text-rose-600 dark:text-rose-400 flex items-center justify-between">
                          <span>{formatCurrency(selectedCustomer.debt)}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(String(selectedCustomer.debt), 'debt')}
                            className="h-8 text-xs font-bold gap-1 border-rose-300 text-rose-700 hover:bg-rose-100"
                          >
                            {copiedField === 'debt' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            {copiedField === 'debt' ? 'Đã chép' : 'Sao chép số tiền'}
                          </Button>
                        </div>
                      </div>

                      {/* Bank Details breakdown */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-primary" /> Ngân hàng:
                          </span>
                          <span className="font-bold text-foreground">CAKE by VPBank</span>
                        </div>

                        <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-primary" /> Số tài khoản:
                          </span>
                          <button
                            onClick={() => copyToClipboard(ACCOUNT_NO, 'stk')}
                            className="font-extrabold text-primary hover:underline flex items-center gap-1"
                          >
                            {ACCOUNT_NO}
                            {copiedField === 'stk' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-muted-foreground" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                          <span className="text-muted-foreground">Chủ tài khoản:</span>
                          <span className="font-bold text-foreground">{ACCOUNT_NAME}</span>
                        </div>

                        <div className="flex items-center justify-between py-1.5">
                          <span className="text-muted-foreground">Nội dung chuyển khoản:</span>
                          <button
                            onClick={() => copyToClipboard(`Thanh toan cong no ${selectedCustomer.name}`, 'memo')}
                            className="font-bold text-foreground hover:underline flex items-center gap-1"
                          >
                            Thanh toan cong no {selectedCustomer.name}
                            {copiedField === 'memo' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Dynamic VietQR Image */}
                    <div className="flex flex-col items-center justify-center p-4 bg-muted/40 rounded-xl border border-border/80 space-y-3">
                      <div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-primary" /> Quét mã để thanh toán nhanh
                      </div>
                      
                      <div className="bg-white p-3 rounded-2xl shadow-md border border-border max-w-[260px]">
                        {/* eslint-disable-next-html-link */}
                        <img
                          src={getQrUrl(selectedCustomer.debt, selectedCustomer.name)}
                          alt={`Mã QR thanh toán công nợ cho ${selectedCustomer.name}`}
                          className="w-full h-auto rounded-lg object-contain"
                          loading="lazy"
                        />
                      </div>

                      <p className="text-[11px] text-muted-foreground text-center italic">
                        * Mã QR tự động điền số tiền {formatCurrency(selectedCustomer.debt)} &amp; nội dung chuyển khoản.
                        * Sau khi chuyển khoản mọi người về chatwork sẽ có bot thông báo thành công ạ.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
