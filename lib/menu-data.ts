import type { MenuItem, Topping } from './types'

export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Bánh Mì Đặc Biệt',
    description: 'Bánh mì với chả cá chiên giòn, trứng chiên, dưa leo, rau răm, nước sốt, tương ớt, ớt',
    price: 20000,
    image: '/1.png',
    category: 'special',
    popular: true,
  },
  {
    id: '2',
    name: 'Bánh Mì Chả Cá',
    description: 'Bánh mì nóng hổi với chả cá chiên giòn, dưa leo, rau răm, nước sốt, tương ớt, ớt',
    price: 15000,
    image: '/2.png',
    category: 'classic',
  },
  {
    id: '3',
    name: 'Bánh Mì Trứng Ốp La',
    description: 'Bánh mì nóng hổi với trứng ốp la, dưa leo, rau răm, nước sốt, tương ớt, ớt',
    price: 15000,
    image: '/3.png',
    category: 'classic',
  },
  {
    id: '4',
    name: 'Bánh Mì Siêu Chả Cá',
    description: 'Bánh mì nóng hổi với nhiều chả cá, dưa leo, rau răm, nước sốt, tương ớt, ớt',
    price: 20000,
    image: '/4.png',
    category: 'classic',
  },
  {
    id: 'd1',
    name: 'Cà Phê Đen',
    description: 'Cà phê đen nguyên chất đậm đà không pha gì cả, thơm ngon, pha phin truyền thống',
    price: 15000,
    image: '/d1.png',
    category: 'drink',
    popular: true,
  },
  {
    id: 'd2',
    name: 'Cà Phê Sữa',
    description: 'Cà phê đen nguyên chất đậm đà không pha gì cả kết hợp sữa đặc ngọt ngào, béo ngậy',
    price: 20000,
    image: '/d2.png',
    category: 'drink',
  },
  {
    id: 'd3',
    name: 'Trà Tắc',
    description: 'Trà kozi mát lạnh kết hợp tắc (quất) chua ngọt, thêm đường vừa phải siu ngon',
    price: 10000,
    image: '/d3.png',
    category: 'drink',
  },
  {
    id: 'd4',
    name: 'Trà đường',
    description: 'Trà kozi mát lạnh kết hợp với sugar, bao ngon, bao đậm chất quê hương chủ shop jet miền tây',
    price: 5000,
    image: '/d4.png',
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
