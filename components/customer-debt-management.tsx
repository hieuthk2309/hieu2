'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  UserPlus,
  Users,
  Wallet,
  Search,
  RefreshCw,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  Phone,
  Calendar,
  FileText,
  DollarSign,
  Minus,
  Plus,
} from 'lucide-react'

export interface Customer {
  id: string
  name: string
  debt: number
  phone?: string | null
  notes?: string | null
  created_at: string
  updated_at?: string
}

export function CustomerDebtManagement() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Form creation state
  const [newName, setNewName] = useState('')
  const [newDebt, setNewDebt] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [debtFilter, setDebtFilter] = useState<'all' | 'has_debt' | 'no_debt'>('all')

  // Edit Debt inline state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDebtValue, setEditDebtValue] = useState<string>('')
  const [editNotesValue, setEditNotesValue] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/customers')
      if (!res.ok) throw new Error('Không thể tải danh sách khách hàng')
      const data = await res.json()
      setCustomers(data.customers || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu khách hàng')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) {
      setError('Vui lòng nhập tên khách hàng')
      return
    }

    try {
      setIsCreating(true)
      setError(null)
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          debt: newDebt ? Number(newDebt) : 0,
          phone: newPhone.trim() || undefined,
          notes: newNotes.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Tạo khách hàng thất bại')

      setSuccessMsg(`Đã tạo thành công khách hàng "${data.customer.name}"`)
      setTimeout(() => setSuccessMsg(null), 3000)

      setNewName('')
      setNewDebt('')
      setNewPhone('')
      setNewNotes('')
      await fetchCustomers()
    } catch (err: any) {
      setError(err.message || 'Không thể tạo khách hàng')
    } finally {
      setIsCreating(false)
    }
  }

  const startEditDebt = (customer: Customer) => {
    setEditingId(customer.id)
    setEditDebtValue(String(customer.debt || 0))
    setEditNotesValue(customer.notes || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditDebtValue('')
    setEditNotesValue('')
  }

  const handleSaveDebt = async (id: string) => {
    try {
      setIsUpdating(id)
      setError(null)
      const numDebt = Math.max(0, Number(editDebtValue) || 0)

      const res = await fetch(`/api/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          debt: numDebt,
          notes: editNotesValue.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Cập nhật công nợ thất bại')

      setSuccessMsg('Đã cập nhật công nợ thành công!')
      setTimeout(() => setSuccessMsg(null), 3000)

      cancelEdit()
      await fetchCustomers()
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật công nợ')
    } finally {
      setIsUpdating(null)
    }
  }

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa khách hàng "${name}" không?`)) return

    try {
      setError(null)
      const res = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Xóa khách hàng thất bại')

      setSuccessMsg(`Đã xóa khách hàng "${name}"`)
      setTimeout(() => setSuccessMsg(null), 3000)

      await fetchCustomers()
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi xóa khách hàng')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const formatDate = (isoStr: string) => {
    if (!isoStr) return ''
    const d = new Date(isoStr)
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Calculate statistics
  const totalDebt = customers.reduce((sum, c) => sum + (c.debt || 0), 0)
  const customersWithDebt = customers.filter(c => (c.debt || 0) > 0)

  // Filtered list
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery))
    
    if (debtFilter === 'has_debt') return matchesSearch && (c.debt || 0) > 0
    if (debtFilter === 'no_debt') return matchesSearch && (c.debt || 0) === 0
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 text-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-500/20 text-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 shrink-0 text-emerald-600" />
            <span className="font-medium">{successMsg}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSuccessMsg(null)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Stats Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-indigo-200/60 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
              Tổng Số Khách Hàng
            </CardTitle>
            <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
              {customers.length} người
            </div>
          </CardContent>
        </Card>

        <Card className="border border-rose-200/60 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rose-900 dark:text-rose-200">
              Tổng Dư Nợ Công Nợ
            </CardTitle>
            <div className="w-9 h-9 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-300">
              {formatPrice(totalDebt)}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-amber-200/60 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-200">
              Khách Đang Có Nợ
            </CardTitle>
            <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
              {customersWithDebt.length} / {customers.length} người
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Add Customer */}
      <Card className="border-border shadow-xs">
        <CardHeader className="py-4 px-6 bg-muted/20 border-b border-border/60">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Tạo Khách Hàng Mới
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Customer Name input */}
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  Tên Khách Hàng <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Nhập tên khách hàng (vd: Anh Nam)..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-background text-sm"
                  required
                />
              </div>

              {/* Initial Debt */}
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-xs font-bold text-foreground">
                  Số Tiền Công Nợ Ban Đầu (VNĐ)
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  step="1000"
                  value={newDebt}
                  onChange={(e) => setNewDebt(e.target.value)}
                  className="bg-background text-sm"
                />
              </div>

              {/* Phone / Notes */}
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-xs font-bold text-foreground">
                  Số Điện Thoại / Ghi Chú (Tùy chọn)
                </label>
                <Input
                  type="text"
                  placeholder="SĐT hoặc ghi chú..."
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="bg-background text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isCreating} className="gap-2 px-6 font-bold">
                {isCreating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Tạo Khách Hàng
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Customer & Debt List */}
      <Card className="border-border shadow-xs">
        <CardHeader className="py-4 px-6 bg-muted/20 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Danh Sách Khách Hàng & Quản Lý Công Nợ ({filteredCustomers.length})
            </CardTitle>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCustomers()}
              disabled={isLoading}
              className="gap-2 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Tải lại
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Tìm tên khách hàng hoặc SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs font-semibold text-muted-foreground shrink-0">Lọc nợ:</span>
              <Button
                variant={debtFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDebtFilter('all')}
                className="text-xs h-8"
              >
                Tất cả ({customers.length})
              </Button>
              <Button
                variant={debtFilter === 'has_debt' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDebtFilter('has_debt')}
                className="text-xs h-8"
              >
                Đang nợ ({customersWithDebt.length})
              </Button>
              <Button
                variant={debtFilter === 'no_debt' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDebtFilter('no_debt')}
                className="text-xs h-8"
              >
                Không nợ ({customers.length - customersWithDebt.length})
              </Button>
            </div>
          </div>

          {/* Customer list rendering */}
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 opacity-60" />
              <p className="font-medium text-sm">Đang tải danh sách công nợ...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground border border-dashed rounded-xl">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <h3 className="font-bold text-foreground text-base mb-1">Chưa có khách hàng nào</h3>
              <p className="text-xs">
                {searchQuery || debtFilter !== 'all'
                  ? 'Không tìm thấy khách hàng phù hợp bộ lọc.'
                  : 'Hãy sử dụng khung bên trên để tạo khách hàng mới.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCustomers.map((customer) => {
                const isEditing = editingId === customer.id
                const hasDebt = (customer.debt || 0) > 0

                return (
                  <div
                    key={customer.id}
                    className={`p-4 rounded-xl border transition-all ${
                      hasDebt
                        ? 'bg-rose-50/30 dark:bg-rose-950/10 border-rose-200/80 dark:border-rose-900/50'
                        : 'bg-card border-border/70 hover:border-border'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Customer Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-foreground text-base">
                            {customer.name}
                          </span>
                          <Badge
                            className={`px-2.5 py-0.5 text-xs font-semibold ${
                              hasDebt
                                ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {hasDebt ? `Nợ: ${formatPrice(customer.debt)}` : 'Hết nợ (0đ)'}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          {customer.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {customer.phone}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Ngày tạo: {formatDate(customer.created_at)}
                          </span>
                          {customer.notes && (
                            <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300">
                              <FileText className="w-3.5 h-3.5" />
                              {customer.notes}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Edit Debt Controls or Actions */}
                      {isEditing ? (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-background p-3 rounded-lg border border-primary/40 shadow-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground shrink-0">
                              Nhập nợ mới:
                            </span>
                            <Input
                              type="number"
                              min="0"
                              step="1000"
                              value={editDebtValue}
                              onChange={(e) => setEditDebtValue(e.target.value)}
                              className="w-32 h-8 text-xs font-bold bg-background"
                              placeholder="Số tiền..."
                              autoFocus
                            />
                            <span className="text-xs font-bold">đ</span>
                          </div>

                          {/* Quick Adjust buttons */}
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="h-8 px-2 text-xs font-medium"
                              onClick={() => {
                                const current = Number(editDebtValue) || 0
                                setEditDebtValue(String(current + 10000))
                              }}
                            >
                              +10k
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="h-8 px-2 text-xs font-medium"
                              onClick={() => {
                                const current = Number(editDebtValue) || 0
                                setEditDebtValue(String(current + 50000))
                              }}
                            >
                              +50k
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 text-xs text-emerald-600 border-emerald-300"
                              onClick={() => setEditDebtValue('0')}
                            >
                              Xóa nợ (0đ)
                            </Button>
                          </div>

                          <div className="flex items-center gap-1.5 ml-auto sm:ml-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-border">
                            <Button
                              size="sm"
                              onClick={() => handleSaveDebt(customer.id)}
                              disabled={isUpdating === customer.id}
                              className="h-8 px-3 text-xs font-bold gap-1"
                            >
                              {isUpdating === customer.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              Lưu
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEdit}
                              className="h-8 px-2 text-xs"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 self-end md:self-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditDebt(customer)}
                            className="h-8 text-xs font-semibold gap-1.5 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Nhập / Sửa Công Nợ
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                            className="h-8 text-xs text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Xóa khách hàng"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
