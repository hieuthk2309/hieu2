import type { MenuItem, Topping } from './types'

export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Bánh Mì Thịt Nguội',
    description: 'Bánh mì giòn với thịt nguội, chả lụa, pate, rau mùi, dưa leo, đồ chua',
    price: 25000,
    image: '/banh-mi-thit-nguoi.jpg',
    category: 'classic',
    popular: true,
  },
  {
    id: '2',
    name: 'Bánh Mì Chả Cá',
    description: 'Bánh mì với chả cá chiên giòn, rau thơm, sốt cà chua',
    price: 28000,
    image: '/banh-mi-cha-ca.jpg',
    category: 'classic',
  },
  {
    id: '3',
    name: 'Bánh Mì Trứng Ốp La',
    description: 'Bánh mì nóng hổi với trứng ốp la, pate, hành phi',
    price: 22000,
    image: '/banh-mi-trung.jpg',
    category: 'classic',
    popular: true,
  },
  {
    id: '4',
    name: 'Bánh Mì Xíu Mại',
    description: 'Bánh mì với xíu mại sốt cà chua đậm đà, rau thơm',
    price: 30000,
    image: '/banh-mi-xiu-mai.jpg',
    category: 'special',
    popular: true,
  },
  {
    id: '5',
    name: 'Bánh Mì Bò Kho',
    description: 'Bánh mì chấm nước bò kho thơm ngon, thịt bò mềm',
    price: 35000,
    image: '/banh-mi-bo-kho.jpg',
    category: 'special',
  },
  {
    id: '6',
    name: 'Bánh Mì Thịt Nướng',
    description: 'Bánh mì với thịt heo nướng than hoa, đồ chua, rau sống',
    price: 32000,
    image: '/banh-mi-thit-nuong.jpg',
    category: 'special',
    popular: true,
  },
  {
    id: '7',
    name: 'Bánh Mì Chay',
    description: 'Bánh mì với đậu hũ chiên, nấm, rau củ xào',
    price: 20000,
    image: '/banh-mi-chay.jpg',
    category: 'vegetarian',
  },
  {
    id: '8',
    name: 'Bánh Mì Bì Chay',
    description: 'Bánh mì với bì chay làm từ đậu nành, rau thơm',
    price: 22000,
    image: '/banh-mi-bi-chay.jpg',
    category: 'vegetarian',
  },
]

export const toppings: Topping[] = [
  { id: 't1', name: 'Thêm Pate', price: 5000 },
  { id: 't2', name: 'Thêm Trứng', price: 8000 },
  { id: 't3', name: 'Thêm Chả', price: 7000 },
  { id: 't4', name: 'Thêm Rau', price: 3000 },
  { id: 't5', name: 'Ớt Cay', price: 0 },
  { id: 't6', name: 'Không Hành', price: 0 },
  { id: 't7', name: 'Thêm Phô Mai', price: 10000 },
]

export const categories = [
  { id: 'all', name: 'Tất Cả' },
  { id: 'classic', name: 'Cổ Điển' },
  { id: 'special', name: 'Đặc Biệt' },
  { id: 'vegetarian', name: 'Chay' },
]
