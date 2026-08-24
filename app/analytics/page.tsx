import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SalesAnalyticsDashboard } from '@/components/sales-analytics-dashboard'
import { CartProvider } from '@/lib/cart-context'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Báo Cáo & Phân Tích Bán Hàng | Dashboard Analytics',
  description: 'Giao diện phân tích doanh thu, biến động số lượng đơn hàng và hiệu suất kinh doanh.',
}

export default function AnalyticsPage() {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-semibold">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Về Trang Chủ</span>
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Hệ thống phân tích bán hàng</span>
            </div>
          </div>
        </header>

        <main className="flex-1 py-4 sm:py-6">
          <SalesAnalyticsDashboard />
        </main>

        <Footer />
      </div>
    </CartProvider>
  )
}
