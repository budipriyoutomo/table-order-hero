import { MenuItem } from '@/types/restaurant';

export const categories = [
  { id: 'appetizers', name: 'Appetizers', icon: '🥗' },
  { id: 'mains', name: 'Main Courses', icon: '🍽️' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'pasta', name: 'Pasta', icon: '🍝' },
  { id: 'drinks', name: 'Drinks', icon: '🥤' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' },
];

export const menuItems: MenuItem[] = [
  // Appetizers
  {
    id: 'app-1',
    name: 'Bruschetta Classica',
    description: 'Grilled bread topped with fresh tomatoes, basil, and garlic',
    price: 8.50,
    image: '/placeholder.svg',
    category: 'appetizers',
    addOns: [
      { id: 'ao-1', name: 'Extra Cheese', price: 2.00 },
      { id: 'ao-2', name: 'Prosciutto', price: 3.50 },
    ],
  },
  {
    id: 'app-2',
    name: 'Calamari Fritti',
    description: 'Crispy fried calamari with marinara dipping sauce',
    price: 12.00,
    image: '/placeholder.svg',
    category: 'appetizers',
    addOns: [
      { id: 'ao-3', name: 'Spicy Aioli', price: 1.50 },
      { id: 'ao-4', name: 'Extra Lemon', price: 0.50 },
    ],
  },
  {
    id: 'app-3',
    name: 'Caprese Salad',
    description: 'Fresh mozzarella, tomatoes, and basil with balsamic glaze',
    price: 10.00,
    image: '/placeholder.svg',
    category: 'appetizers',
    addOns: [
      { id: 'ao-5', name: 'Burrata Upgrade', price: 4.00 },
    ],
  },
  // Mains
  {
    id: 'main-1',
    name: 'Grilled Salmon',
    description: 'Atlantic salmon with lemon herb butter and seasonal vegetables',
    price: 24.00,
    image: '/placeholder.svg',
    category: 'mains',
    addOns: [
      { id: 'ao-6', name: 'Extra Vegetables', price: 4.00 },
      { id: 'ao-7', name: 'Garlic Mashed Potatoes', price: 5.00 },
    ],
  },
  {
    id: 'main-2',
    name: 'Ribeye Steak',
    description: '12oz prime ribeye with truffle butter and roasted potatoes',
    price: 38.00,
    image: '/placeholder.svg',
    category: 'mains',
    addOns: [
      { id: 'ao-8', name: 'Blue Cheese Crust', price: 4.50 },
      { id: 'ao-9', name: 'Grilled Shrimp', price: 8.00 },
    ],
  },
  {
    id: 'main-3',
    name: 'Chicken Marsala',
    description: 'Pan-seared chicken with mushroom marsala wine sauce',
    price: 22.00,
    image: '/placeholder.svg',
    category: 'mains',
    addOns: [
      { id: 'ao-10', name: 'Extra Mushrooms', price: 3.00 },
    ],
  },
  // Pizza
  {
    id: 'pizza-1',
    name: 'Margherita',
    description: 'San Marzano tomatoes, fresh mozzarella, and basil',
    price: 16.00,
    image: '/placeholder.svg',
    category: 'pizza',
    addOns: [
      { id: 'ao-11', name: 'Extra Cheese', price: 3.00 },
      { id: 'ao-12', name: 'Truffle Oil', price: 4.00 },
    ],
  },
  {
    id: 'pizza-2',
    name: 'Diavola',
    description: 'Spicy salami, mozzarella, and chili flakes',
    price: 18.00,
    image: '/placeholder.svg',
    category: 'pizza',
    addOns: [
      { id: 'ao-13', name: 'Extra Spicy', price: 1.00 },
      { id: 'ao-14', name: 'Fresh Jalapeños', price: 2.00 },
    ],
  },
  {
    id: 'pizza-3',
    name: 'Quattro Formaggi',
    description: 'Four cheese blend with gorgonzola, fontina, mozzarella, and parmesan',
    price: 19.00,
    image: '/placeholder.svg',
    category: 'pizza',
    addOns: [
      { id: 'ao-15', name: 'Honey Drizzle', price: 2.00 },
      { id: 'ao-16', name: 'Walnuts', price: 2.50 },
    ],
  },
  // Pasta
  {
    id: 'pasta-1',
    name: 'Spaghetti Carbonara',
    description: 'Classic Roman pasta with guanciale, egg, and pecorino',
    price: 17.00,
    image: '/placeholder.svg',
    category: 'pasta',
    addOns: [
      { id: 'ao-17', name: 'Extra Guanciale', price: 4.00 },
      { id: 'ao-18', name: 'Truffle Shavings', price: 6.00 },
    ],
  },
  {
    id: 'pasta-2',
    name: 'Penne Arrabbiata',
    description: 'Spicy tomato sauce with garlic and red chili',
    price: 14.00,
    image: '/placeholder.svg',
    category: 'pasta',
    addOns: [
      { id: 'ao-19', name: 'Grilled Chicken', price: 5.00 },
      { id: 'ao-20', name: 'Extra Spicy', price: 1.00 },
    ],
  },
  {
    id: 'pasta-3',
    name: 'Fettuccine Alfredo',
    description: 'Creamy parmesan sauce with fresh fettuccine',
    price: 16.00,
    image: '/placeholder.svg',
    category: 'pasta',
    addOns: [
      { id: 'ao-21', name: 'Grilled Shrimp', price: 7.00 },
      { id: 'ao-22', name: 'Broccoli', price: 3.00 },
    ],
  },
  // Drinks
  {
    id: 'drink-1',
    name: 'Italian Soda',
    description: 'Sparkling water with your choice of fruit syrup',
    price: 4.00,
    image: '/placeholder.svg',
    category: 'drinks',
    addOns: [
      { id: 'ao-23', name: 'Extra Flavor Shot', price: 0.75 },
    ],
  },
  {
    id: 'drink-2',
    name: 'Fresh Lemonade',
    description: 'Freshly squeezed lemons with a hint of mint',
    price: 5.00,
    image: '/placeholder.svg',
    category: 'drinks',
    addOns: [
      { id: 'ao-24', name: 'Sparkling', price: 1.00 },
    ],
  },
  {
    id: 'drink-3',
    name: 'Espresso',
    description: 'Double shot of Italian espresso',
    price: 3.50,
    image: '/placeholder.svg',
    category: 'drinks',
    addOns: [
      { id: 'ao-25', name: 'Extra Shot', price: 1.50 },
      { id: 'ao-26', name: 'Oat Milk', price: 1.00 },
    ],
  },
  // Desserts
  {
    id: 'dessert-1',
    name: 'Tiramisu',
    description: 'Classic Italian dessert with mascarpone and espresso',
    price: 9.00,
    image: '/placeholder.svg',
    category: 'desserts',
    addOns: [
      { id: 'ao-27', name: 'Extra Cocoa', price: 0.50 },
    ],
  },
  {
    id: 'dessert-2',
    name: 'Panna Cotta',
    description: 'Vanilla cream with berry compote',
    price: 8.00,
    image: '/placeholder.svg',
    category: 'desserts',
    addOns: [
      { id: 'ao-28', name: 'Chocolate Sauce', price: 1.50 },
    ],
  },
  {
    id: 'dessert-3',
    name: 'Gelato Trio',
    description: 'Three scoops of artisan Italian gelato',
    price: 7.50,
    image: '/placeholder.svg',
    category: 'desserts',
    addOns: [
      { id: 'ao-29', name: 'Whipped Cream', price: 1.00 },
      { id: 'ao-30', name: 'Waffle Cone', price: 1.50 },
    ],
  },
];
