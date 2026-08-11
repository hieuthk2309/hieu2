'use client'

import { ArrowDown, Clock, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Đang mở cửa
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Bánh Mì Hieudeptrai
              <span className="text-primary"> Ngon Tuyệt</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg text-pretty">
              Thưởng thức hương vị bánh mì truyền thống Sài Gòn với nguyên liệu tươi ngon, 
              được chuẩn bị tỉ mỉ mỗi ngày. Giao hàng nhanh chóng trong 30 phút!
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <a href="#menu">
                  Xem Thực Đơn
                  <ArrowDown className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="tel:0901234567">
                  <Phone className="w-4 h-4 mr-2" />
                  Gọi Đặt Hàng
                </a>
              </Button>
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-primary" />
                <span>6:00 - 21:00</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>123 Nguyễn Huệ, Q.1, TP.HCM</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="aspect-square relative">
              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"></div>
              
              {/* Main visual */}
              <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-9xl md:text-[10rem]">🥖</span>
                  <div className="mt-4 space-y-2">
                    <div className="bg-card shadow-lg rounded-full px-6 py-3 inline-block">
                      <span className="font-bold text-primary">Từ 20.000đ</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute top-4 right-4 bg-card shadow-lg rounded-xl px-4 py-2 animate-bounce">
                <span className="text-sm font-semibold text-foreground">Giao 30 phút</span>
              </div>
              <div className="absolute bottom-8 left-0 bg-card shadow-lg rounded-xl px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <span className="font-bold text-foreground">4.9</span>
                    <span className="text-xs text-muted-foreground ml-1">(500+ đánh giá)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
