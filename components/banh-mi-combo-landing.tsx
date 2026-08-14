'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  Flame,
  ShoppingBag,
  Sparkles,
  X,
  Copy,
  Check,
  ArrowRight,
  Gift,
  Clock,
  ShieldCheck,
  Percent,
} from 'lucide-react'

interface BanhMiComboLandingProps {
  /** Path to the combo banner image (default: /banner_combo.png) */
  bannerSrc?: string
  /** Starting price of the combo in VND string/number */
  comboStartingPrice?: string
  /** Voucher code provided in the exit-intent popup */
  freeshipCode?: string
  /** Callback when user clicks any CTA button */
  onOrderClick?: () => void
}

/**
 * Helper to check if a specific cookie exists in document.cookie
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie.split(';')
  for (let i = 0; i < cookies.length; i++) {
    const c = cookies[i].trim()
    if (c.startsWith(name + '=')) {
      return decodeURIComponent(c.substring(name.length + 1))
    }
  }
  return null
}

export function BanhMiComboLanding({
  bannerSrc = '/banner_combo.png',
  comboStartingPrice = '35.000đ',
  freeshipCode = 'FREESHIPCOMBO',
  onOrderClick,
}: BanhMiComboLandingProps) {
  // ── State 1: Sticky Top Bar visibility
  const [showStickyBar, setShowStickyBar] = useState(false)
  const [isStickyDismissed, setIsStickyDismissed] = useState(false)

  // ── State 2: Exit-Intent Modal visibility
  const [showExitModal, setShowExitModal] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // Smooth scroll or trigger order action
  const handleScrollToMenu = useCallback(() => {
    if (onOrderClick) {
      onOrderClick()
    } else {
      const menuEl = document.getElementById('menu')
      if (menuEl) {
        menuEl.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.scrollTo({ top: 600, behavior: 'smooth' })
      }
    }
  }, [onOrderClick])

  // ────────────────────────────────────────────────────────────
  // FEATURE 2: Sticky Top Bar on Scroll (> 300px)
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowStickyBar(true)
      } else {
        setShowStickyBar(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ────────────────────────────────────────────────────────────
  // FEATURE 3: Exit-Intent Trigger with Cookie & Session Check
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse moves past the top of viewport (trying to close tab / switch address bar)
      if (e.clientY <= 0 || (e.relatedTarget === null && e.clientY <= 10)) {
        // 1. Check Cookie: if "has_order" exists -> DO NOT show modal
        const hasOrderCookie = getCookie('has_order')
        if (hasOrderCookie) {
          return
        }

        // 2. Check SessionStorage: only trigger ONCE per session to prevent spamming
        const hasTriggeredInSession = sessionStorage.getItem('has_shown_exit_intent')
        if (hasTriggeredInSession) {
          return
        }

        // 3. Show Exit Intent Modal
        sessionStorage.setItem('has_shown_exit_intent', 'true')
        setShowExitModal(true)
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [])

  // Copy discount voucher code
  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(freeshipCode)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2500)
    }
  }

  // Claim voucher and jump to order
  const handleClaimVoucherAndOrder = () => {
    handleCopyCode()
    setShowExitModal(false)
    handleScrollToMenu()
  }

  return (
    <>
      {/* ────────────────────────────────────────────────────────
          FEATURE 2: STICKY TOP NOTIFICATION BAR (Scroll-triggered)
          ──────────────────────────────────────────────────────── */}
      <aside
        aria-label="Khuyến mãi nhanh"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out transform ${
          showStickyBar && !isStickyDismissed
            ? 'translate-y-0 opacity-100 shadow-md'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white px-3 py-2 sm:py-2.5">
          <div className="container mx-auto flex items-center justify-between gap-2 max-w-6xl">
            {/* Promo Text with Pulsing Fire Icon */}
            <div className="flex items-center gap-2 min-w-0 text-xs sm:text-sm font-semibold truncate">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 shrink-0">
                <Flame className="w-4 h-4 text-amber-300 animate-pulse fill-amber-300" />
              </span>
              <span className="truncate">
                <span className="font-extrabold text-amber-200">Đừng bỏ lỡ:</span> Combo Bánh Mì + Nước chỉ từ{' '}
                <span className="font-extrabold underline decoration-amber-300">{comboStartingPrice}</span>!
              </span>
            </div>

            {/* Small Action Button & Close */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleScrollToMenu}
                className="bg-white text-orange-700 hover:bg-amber-100 font-extrabold text-xs px-3 py-1.5 rounded-full transition-all shadow-xs hover:scale-105 active:scale-95 flex items-center gap-1"
              >
                <span>Mua Ngay</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => setIsStickyDismissed(true)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                title="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ────────────────────────────────────────────────────────
          FEATURE 1: HERO SECTION BANNER (Top Section)
          ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-background border-b border-border/60">
        {/* Background ambient glow spots */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute top-1/2 right-10 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16 max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Headlines, Value Props & Main CTA */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              {/* Promo Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
                <span>COMBO SIÊU TIẾT KIỆM • BÁN CHẠY NHẤT</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-[1.15]">
                Combo <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-rose-600">Bánh Mì Giòn Rụm</span> + Nước Mát Lạnh
              </h1>

              {/* Sub-headline */}
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Bánh mì nướng nóng hổi ngập tràn nhân thịt, chả, pate béo ngậy kết hợp hoàn hảo cùng ly cà phê đậm đà hoặc trà mát lạnh sảng khoái.
              </p>

              {/* Highlights Feature Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 text-xs text-foreground/80 font-medium">
                <span className="flex items-center gap-1.5 bg-background/80 border border-border px-3 py-1.5 rounded-xl shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />
                  Giao nhanh 15–30 phút
                </span>
                <span className="flex items-center gap-1.5 bg-background/80 border border-border px-3 py-1.5 rounded-xl shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  100% Nguyên liệu tươi ngon
                </span>
                <span className="flex items-center gap-1.5 bg-background/80 border border-border px-3 py-1.5 rounded-xl shadow-2xs">
                  <Percent className="w-3.5 h-3.5 text-rose-500" />
                  Tiết kiệm đến 25%
                </span>
              </div>

              {/* PROMINENT CALL TO ACTION (CTA) BUTTON */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  type="button"
                  onClick={handleScrollToMenu}
                  className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white font-black text-base sm:text-lg shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  {/* Shimmer sweep animation */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-out" />
                  
                  <ShoppingBag className="w-5 h-5 text-white transition-transform group-hover:rotate-12" />
                  <span className="tracking-wide">ĐẶT COMBO NGAY</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>

                <div className="text-xs text-muted-foreground text-center sm:text-left">
                  <span className="font-bold text-foreground block">Chỉ từ {comboStartingPrice}</span>
                  <span>Miễn phí giao hàng đơn từ 50k</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Banner Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none group">
                {/* Decorative glowing card frame */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500 to-rose-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500" />

                <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/20 bg-card shadow-2xl">
                  {/* Aspect Ratio Container */}
                  <div className="relative w-full aspect-[4/3] sm:aspect-[16/11]">
                    <Image
                      src={bannerSrc}
                      alt="Combo Bánh Mì và Nước Uống Thơm Ngon"
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 450px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Floating Price Tag on top of image */}
                  <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-slate-900/90 backdrop-blur-md border border-amber-500/40 text-white px-3.5 py-2 rounded-2xl shadow-lg flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-sm text-white shadow-xs">
                      🔥
                    </div>
                    <div>
                      <div className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">Giá ưu đãi</div>
                      <div className="text-sm sm:text-base font-black text-white leading-none mt-0.5">
                        Từ {comboStartingPrice}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────
          FEATURE 3: EXIT-INTENT MODAL (With Cookie & Session Check)
          ──────────────────────────────────────────────────────── */}
      {showExitModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowExitModal(false)
          }}
        >
          <div className="relative w-full max-w-md bg-card border-2 border-orange-500/30 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Top Header with Gradient */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 text-white text-center relative">
              {/* Close Button "X" */}
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 p-1.5 rounded-full transition-colors"
                aria-label="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl shadow-md">
                🎁
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                Khoan đã! Tặng bạn mã freeship cho Combo Bánh mì + Nước nè!
              </h2>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-center">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Đừng bỏ lỡ bữa ăn ngon miệng hôm nay! Áp dụng ngay mã ưu đãi để nhận <strong className="text-foreground">Freeship 100%</strong> cho đơn hàng Combo của bạn.
              </p>

              {/* Voucher Code Box */}
              <div className="flex items-center justify-between gap-2 p-3 bg-muted/60 border-2 border-dashed border-orange-500/40 rounded-2xl">
                <div className="flex items-center gap-2 pl-2">
                  <Gift className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="font-mono font-black text-base sm:text-lg text-orange-600 dark:text-orange-400 tracking-wider">
                    {freeshipCode}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Đã chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleClaimVoucherAndOrder}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white font-black text-sm sm:text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Nhận Mã Ngay & Đặt Hàng</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium py-1 transition-colors"
                >
                  Không, cảm ơn • Tôi muốn xem tiếp
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
export default BanhMiComboLanding
