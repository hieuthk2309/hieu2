'use client'

import { ArrowDown, Clock, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-r from-primary/5 via-background to-amber-500/5">
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

          {/* Left: Brand + tagline */}
          <div className="space-y-3 flex-1">
            {/* Open badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Đang mở cửa • 6:00 – 21:00
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">
              Bánh Mì Hieudeptrai
              <span className="text-primary"> – Ngon Tuyệt</span>
            </h1>

            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Bánh mì tươi giòn kết hợp cà phê phin thơm ngon – bữa sáng hoàn hảo mỗi ngày.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" asChild>
                <a href="#menu">
                  Xem Thực Đơn
                  <ArrowDown className="w-3.5 h-3.5 ml-1.5" />
                </a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href="tel:0799132435">
                  <Phone className="w-3.5 h-3.5 mr-1.5" />
                  Gọi Đặt Hàng
                </a>
              </Button>
            </div>
          </div>

          {/* Right: combo showcase */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            {/* Bánh mì card */}
            <div className="flex flex-col items-center gap-2 bg-card border border-border rounded-2xl px-4 py-4 shadow-sm hover:shadow-md transition-shadow min-w-[110px]">
              <span className="text-4xl">🥖</span>
              <div className="text-center">
                <p className="text-xs font-bold text-foreground">Bánh Mì</p>
                <p className="text-xs text-primary font-semibold">Từ 15.000đ</p>
              </div>
            </div>

            {/* Separator */}
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <span className="text-lg font-light">+</span>
            </div>

            {/* Nước card */}
            <div className="flex flex-col items-center gap-2 bg-card border border-border rounded-2xl px-4 py-4 shadow-sm hover:shadow-md transition-shadow min-w-[110px]">
              <span className="text-4xl">☕</span>
              <div className="text-center">
                <p className="text-xs font-bold text-foreground">Đồ Uống</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Từ 15.000đ</p>
              </div>
            </div>

            {/* Giao nhanh badge */}
            <div className="hidden sm:flex flex-col items-center gap-2 bg-primary/5 border border-primary/20 rounded-2xl px-4 py-4 min-w-[100px]">
              <Clock className="w-7 h-7 text-primary" />
              <div className="text-center">
                <p className="text-xs font-bold text-foreground">Giao Nhanh</p>
                <p className="text-xs text-muted-foreground font-medium">30 phút</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
