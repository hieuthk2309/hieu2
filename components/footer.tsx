import { Clock, MapPin, Phone, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer id="contact" className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">B</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Bánh Mì Sài Gòn</h3>
                <p className="text-xs text-background/70">Ngon - Nhanh - Tiện</p>
              </div>
            </div>
            <p className="text-sm text-background/70">
              Mang đến cho bạn hương vị bánh mì truyền thống Sài Gòn chính hiệu, 
              với nguyên liệu tươi ngon được chọn lọc kỹ lưỡng.
            </p>
          </div>

          {/* Contact Info */}
          <div id="about" className="space-y-4">
            <h4 className="font-semibold text-lg">Liên Hệ</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-background/70">
                <MapPin className="w-4 h-4 text-primary" />
                <span>123 Nguyễn Huệ, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-background/70">
                <Phone className="w-4 h-4 text-primary" />
                <span>0901 234 567</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-background/70">
                <Mail className="w-4 h-4 text-primary" />
                <span>hello@banhmisaigon.vn</span>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Giờ Mở Cửa</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-background/70">
                <Clock className="w-4 h-4 text-primary" />
                <div>
                  <p>Thứ 2 - Thứ 6: 6:00 - 21:00</p>
                  <p>Thứ 7 - CN: 7:00 - 22:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/50">
          <p>&copy; 2026 Bánh Mì Sài Gòn. Đã đăng ký bản quyền.</p>
        </div>
      </div>
    </footer>
  )
}
