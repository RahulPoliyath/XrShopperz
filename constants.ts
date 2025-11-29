import { Product, Category } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Quantum X Wireless Headphones',
    price: 299.99,
    description: 'Experience pure sound with the Quantum X. Featuring adaptive noise cancellation and 40-hour battery life.',
    category: Category.ELECTRONICS,
    image: 'https://picsum.photos/400/400?random=1',
    rating: 4.8,
    reviews: 124
  },
  {
    id: '2',
    name: 'Urban Drift Smartwatch',
    price: 199.50,
    description: 'Track your life in style. The Urban Drift monitors health, notifications, and sleep patterns with a sleek design.',
    category: Category.ELECTRONICS,
    image: 'https://picsum.photos/400/400?random=2',
    rating: 4.5,
    reviews: 89
  },
  {
    id: '3',
    name: 'NeoComfort Running Shoes',
    price: 120.00,
    description: 'Run on clouds. Engineered mesh upper and foam sole provide unparalleled comfort for long distances.',
    category: Category.FASHION,
    image: 'https://picsum.photos/400/400?random=3',
    rating: 4.7,
    reviews: 210
  },
  {
    id: '4',
    name: 'Minimalist Oak Desk',
    price: 450.00,
    description: 'A sturdy, beautiful workspace. Solid oak construction with a matte finish perfectly fits modern home offices.',
    category: Category.HOME,
    image: 'https://picsum.photos/400/400?random=4',
    rating: 4.9,
    reviews: 56
  },
  {
    id: '5',
    name: 'Pro-Grip Yoga Mat',
    price: 45.00,
    description: 'Stay grounded. Non-slip surface ensures stability during the most challenging poses.',
    category: Category.SPORTS,
    image: 'https://picsum.photos/400/400?random=5',
    rating: 4.6,
    reviews: 340
  },
];
