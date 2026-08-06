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
  // {
  //   id: '4',
  //   name: 'Cà phê đen',
  //   description: 'Bánh mì với xíu mại sốt cà chua đậm đà, rau thơm',
  //   price: 30000,
  //   image: '/banh-mi-xiu-mai.jpg',
  //   category: 'special',
  //   popular: true,
  // },
  // {
  //   id: '5',
  //   name: 'Cà phê sữa',
  //   description: 'Bánh mì chấm nước bò kho thơm ngon, thịt bò mềm',
  //   price: 35000,
  //   image: '/banh-mi-bo-kho.jpg',
  //   category: 'special',
  // },
  // {
  //   id: '6',
  //   name: 'Bánh Mì Thịt Nướng',
  //   description: 'Bánh mì với thịt heo nướng than hoa, đồ chua, rau sống',
  //   price: 32000,
  //   image: '/banh-mi-thit-nuong.jpg',
  //   category: 'special',
  //   popular: true,
  // },
  // {
  //   id: '7',
  //   name: 'Bánh Mì Chay',
  //   description: 'Bánh mì với đậu hũ chiên, nấm, rau củ xào',
  //   price: 20000,
  //   image: '/banh-mi-chay.jpg',
  //   category: 'vegetarian',
  // },
  // {
  //   id: '8',
  //   name: 'Bánh Mì Bì Chay',
  //   description: 'Bánh mì với bì chay làm từ đậu nành, rau thơm',
  //   price: 22000,
  //   image: '/banh-mi-bi-chay.jpg',
  //   category: 'vegetarian',
  // },
]

export const toppings: Topping[] = [
  // { id: 't1', name: 'Thêm chả cá', price: 5000 },
  // { id: 't2', name: 'Thêm Trứng', price: 5000 },
]

export const categories = [
  { id: 'all', name: 'Tất Cả' },
  { id: 'classic', name: 'Cổ Điển' },
  { id: 'special', name: 'Đặc Biệt' },
  // { id: 'vegetarian', name: 'Chay' },
]
