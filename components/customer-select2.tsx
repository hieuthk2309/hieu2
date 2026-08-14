'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Search,
  Check,
  ChevronsUpDown,
  X,
  User,
  Phone,
  Wallet,
  PlusCircle,
  Loader2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface CustomerOption {
  id: string
  name: string
  debt: number
  phone?: string | null
  notes?: string | null
}

interface CustomerSelect2Props {
  customers: CustomerOption[]
  selectedCustomerId: string | null
  onSelectCustomer: (customer: CustomerOption | null) => void
  onCustomerCreated?: (newCustomer: CustomerOption) => void
  placeholder?: string
  disabled?: boolean
  className?: string
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

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

export function CustomerSelect2({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onCustomerCreated,
  placeholder = 'Tìm hoặc chọn khách hàng...',
  disabled = false,
  className = '',
}: CustomerSelect2Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [isCreatingNew, setIsCreatingNew] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => String(c.id) === String(selectedCustomerId)) || null
  }, [customers, selectedCustomerId])

  // Filter customers with Vietnamese accent removal
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers

    const cleanQuery = removeAccents(searchQuery)
    return customers.filter((c) => {
      const cleanName = removeAccents(c.name || '')
      const cleanPhone = removeAccents(c.phone || '')
      return cleanName.includes(cleanQuery) || cleanPhone.includes(cleanQuery)
    })
  }, [customers, searchQuery])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
      setActiveIndex(0)
    } else {
      setSearchQuery('')
    }
  }, [isOpen])

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  // Keyboard navigation inside dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) =>
        prev < filteredCustomers.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredCustomers.length > 0 && activeIndex >= 0 && activeIndex < filteredCustomers.length) {
        handleSelect(filteredCustomers[activeIndex])
      } else if (searchQuery.trim()) {
        handleQuickCreateCustomer()
      }
    }
  }

  // Auto scroll active item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [activeIndex, isOpen])

  const handleSelect = (customer: CustomerOption) => {
    onSelectCustomer(customer)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelectCustomer(null)
  }

  const handleQuickCreateCustomer = async () => {
    const name = searchQuery.trim()
    if (!name || isCreatingNew) return

    try {
      setIsCreatingNew(true)
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          debt: 0,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Tạo khách hàng thất bại')

      const created: CustomerOption = data.customer
      if (onCustomerCreated) {
        onCustomerCreated(created)
      }
      onSelectCustomer(created)
      setIsOpen(false)
      setSearchQuery('')
    } catch (err) {
      console.error('Lỗi khi tạo nhanh khách hàng:', err)
    } finally {
      setIsCreatingNew(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full text-left select-none ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Select2 Trigger Box */}
      <div
        role="combobox"
        aria-expanded={isOpen}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`flex min-h-[44px] w-full items-center justify-between rounded-xl border bg-background px-3.5 py-2 text-sm shadow-xs transition-all duration-150 cursor-pointer ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-muted'
            : isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 dark:ring-indigo-400/20'
            : 'border-input hover:border-slate-400 dark:hover:border-slate-600'
        }`}
      >
        {selectedCustomer ? (
          <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center shrink-0 font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-sm truncate">
                  {selectedCustomer.name}
                </span>
                {selectedCustomer.phone && (
                  <span className="text-xs text-muted-foreground hidden sm:inline-flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {selectedCustomer.phone}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <span>Nợ hiện tại:</span>
                <span
                  className={`font-semibold ${
                    selectedCustomer.debt > 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {formatPrice(selectedCustomer.debt || 0)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
            <User className="w-4 h-4 opacity-50" />
            <span>{placeholder}</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-muted-foreground shrink-0 ml-2">
          {selectedCustomer && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md hover:bg-muted hover:text-foreground transition-colors"
              title="Xóa lựa chọn"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronsUpDown className="w-4 h-4 opacity-60" />
        </div>
      </div>

      {/* Select2 Dropdown Overlay */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 origin-top rounded-xl border border-border bg-popover text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95 duration-100 overflow-hidden">
          {/* Search Box */}
          <div className="p-2 border-b border-border bg-muted/40 sticky top-0 z-10">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setActiveIndex(0)
                }}
                placeholder="Gõ tên hoặc SĐT khách hàng để tìm kiếm..."
                className="w-full h-9 rounded-lg bg-background border border-input pl-9 pr-8 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium placeholder:text-muted-foreground/70"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    searchInputRef.current?.focus()
                  }}
                  className="absolute right-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Customer Items List */}
          <div
            ref={listRef}
            className="max-h-60 overflow-y-auto p-1.5 space-y-1 divide-y divide-border/30"
          >
            {filteredCustomers.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-3 font-medium">
                  {searchQuery
                    ? `Không tìm thấy khách hàng "${searchQuery}"`
                    : 'Chưa có dữ liệu khách hàng'}
                </p>
                {searchQuery.trim() && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleQuickCreateCustomer}
                    disabled={isCreatingNew}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium text-xs shadow-xs"
                  >
                    {isCreatingNew ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <PlusCircle className="w-3.5 h-3.5" />
                    )}
                    Thêm nhanh khách hàng &quot;{searchQuery.trim()}&quot;
                  </Button>
                )}
              </div>
            ) : (
              filteredCustomers.map((customer, index) => {
                const isSelected =
                  String(customer.id) === String(selectedCustomerId)
                const isActive = index === activeIndex

                return (
                  <div
                    key={customer.id}
                    onClick={() => handleSelect(customer)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors text-sm ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-100 font-semibold'
                        : isActive
                        ? 'bg-muted/80 text-foreground'
                        : 'hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm truncate">
                          {customer.name}
                        </span>
                        {customer.phone && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />
                            {customer.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md font-mono font-medium ${
                          (customer.debt || 0) > 0
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {(customer.debt || 0) > 0
                          ? `Nợ: ${formatPrice(customer.debt)}`
                          : '0 ₫'}
                      </span>

                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 font-bold" />
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer Bar */}
          {filteredCustomers.length > 0 && searchQuery.trim() && (
            <div className="p-2 border-t border-border bg-muted/20 text-xs flex items-center justify-between">
              <span className="text-muted-foreground text-[11px]">
                Tìm thấy {filteredCustomers.length} khách hàng
              </span>
              <button
                type="button"
                onClick={handleQuickCreateCustomer}
                disabled={isCreatingNew}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-[11px] flex items-center gap-1"
              >
                {isCreatingNew ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <PlusCircle className="w-3 h-3" />
                )}
                Tạo mới &quot;{searchQuery.trim()}&quot;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
