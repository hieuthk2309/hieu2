import type { MenuItem, Topping } from './types'

export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Bánh Mì Đặc Biệt',
    description: 'Bánh mì với chả cá chiên giòn, trứng chiên, dưa leo, rau răm, nước sốt, tương ớt, ớt',
    price: 20000,
    image: '/banh-mi-thit-nguoi.jpg',
    category: 'special',
    popular: true,
  },
  {
    id: '2',
    name: 'Bánh Mì Chả Cá',
    description: 'Bánh mì với chả cá chiên giòn, dưa leo siu ngon',
    price: 15000,
    image: '/banh-mi-cha-ca.jpg',
    category: 'classic',
  },
  {
    id: '3',
    name: 'Bánh Mì Trứng Ốp La',
    description: 'Bánh mì nóng hổi với trứng ốp la, dưa leo siu ngon',
    price: 15000,
    image: '/banh-mi-trung.jpg',
    category: 'classic',
  },
  {
    id: 'd1',
    name: 'Cà Phê Đen',
    description: 'Cà phê đen nguyên chất đậm đà, thơm ngon, pha phin truyền thống',
    price: 15000,
    image: '/ca-phe-den.jpg',
    category: 'drink',
    popular: true,
  },
  {
    id: 'd2',
    name: 'Cà Phê Sữa',
    description: 'Cà phê phin kết hợp sữa đặc ngọt ngào, béo ngậy',
    price: 20000,
    image: '/ca-phe-sua.jpg',
    category: 'drink',
  },
  {
    id: 'd3',
    name: 'Trà Tắc',
    description: 'Trà xanh tươi mát kết hợp tắc (quất) chua ngọt, thêm đường vừa phải',
    price: 10000,
    image: '/tra-tac.jpg',
    category: 'drink',
  },
]

export const toppings: Topping[] = []

export const categories = [
  { id: 'all', name: 'Tất Cả' },
  { id: 'classic', name: 'Cổ Điển' },
  { id: 'special', name: 'Đặc Biệt' },
]

export const foodItems: MenuItem[] = menuItems.filter((item) => item.category !== 'drink')
export const drinkItems: MenuItem[] = menuItems.filter((item) => item.category === 'drink')
