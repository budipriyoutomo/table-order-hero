import { CartItem } from '@/types/restaurant';
import { menuItems } from './menuData';

export interface TableOrder {
  tableNumber: number;
  items: CartItem[];
  guestCount: number;
  guestType: string;
  createdAt: Date;
}

// Helper to create cart items from menu items
const createCartItem = (menuItemId: string, quantity: number, notes: string = '', addOnIds: string[] = []): CartItem => {
  const menuItem = menuItems.find(item => item.id === menuItemId);
  if (!menuItem) throw new Error(`Menu item ${menuItemId} not found`);
  
  const selectedAddOns = menuItem.addOns.filter(addOn => addOnIds.includes(addOn.id));
  
  return {
    id: `${menuItemId}-${Date.now()}-${Math.random()}`,
    menuItem,
    quantity,
    selectedAddOns,
    notes,
  };
};

// Sample existing orders for occupied tables
export const tableOrders: TableOrder[] = [
  {
    tableNumber: 3,
    items: [
      createCartItem('app-1', 2, 'Extra crispy please'),
      createCartItem('main-2', 1, '', ['ao-8']),
      createCartItem('drink-1', 2),
    ],
    guestCount: 3,
    guestType: 'regular',
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
  },
  {
    tableNumber: 5,
    items: [
      createCartItem('main-1', 1, 'Well done'),
      createCartItem('main-3', 1),
      createCartItem('drink-2', 2),
      createCartItem('dessert-1', 1, '', ['ao-27']),
    ],
    guestCount: 2,
    guestType: 'vip',
    createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
  },
  {
    tableNumber: 7,
    items: [
      createCartItem('app-2', 1),
      createCartItem('pizza-1', 2, 'No mushrooms'),
      createCartItem('drink-3', 3),
    ],
    guestCount: 4,
    guestType: 'member',
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
  },
  {
    tableNumber: 8,
    items: [
      createCartItem('app-3', 2, '', ['ao-5']),
      createCartItem('pasta-1', 1),
      createCartItem('drink-1', 4),
    ],
    guestCount: 6,
    guestType: 'family',
    createdAt: new Date(Date.now() - 20 * 60 * 1000), // 20 mins ago
  },
  {
    tableNumber: 10,
    items: [
      createCartItem('app-1', 1),
      createCartItem('pizza-3', 1, 'Extra cheese', ['ao-15']),
      createCartItem('pasta-2', 2),
      createCartItem('dessert-2', 2),
    ],
    guestCount: 3,
    guestType: 'regular',
    createdAt: new Date(Date.now() - 50 * 60 * 1000), // 50 mins ago
  },
  {
    tableNumber: 12,
    items: [
      createCartItem('app-2', 2),
      createCartItem('main-1', 1),
      createCartItem('pasta-2', 1, '', ['ao-19']),
    ],
    guestCount: 2,
    guestType: 'vip',
    createdAt: new Date(Date.now() - 70 * 60 * 1000), // 70 mins ago
  },
];

export const getOrderByTable = (tableNumber: number): TableOrder | undefined => {
  return tableOrders.find(order => order.tableNumber === tableNumber);
};
