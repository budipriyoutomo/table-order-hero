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
      createCartItem('1', 2, 'Extra crispy please'),
      createCartItem('7', 1, '', ['ao-8']),
      createCartItem('15', 2),
    ],
    guestCount: 3,
    guestType: 'regular',
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
  },
  {
    tableNumber: 5,
    items: [
      createCartItem('8', 1, 'Well done'),
      createCartItem('9', 1),
      createCartItem('16', 2),
      createCartItem('19', 1, '', ['ao-26']),
    ],
    guestCount: 2,
    guestType: 'vip',
    createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
  },
  {
    tableNumber: 7,
    items: [
      createCartItem('2', 1),
      createCartItem('10', 2, 'No mushrooms'),
      createCartItem('17', 3),
    ],
    guestCount: 4,
    guestType: 'member',
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
  },
  {
    tableNumber: 8,
    items: [
      createCartItem('3', 2, '', ['ao-4']),
      createCartItem('11', 1),
      createCartItem('18', 4),
    ],
    guestCount: 6,
    guestType: 'family',
    createdAt: new Date(Date.now() - 20 * 60 * 1000), // 20 mins ago
  },
  {
    tableNumber: 10,
    items: [
      createCartItem('4', 1),
      createCartItem('12', 1, 'Extra cheese', ['ao-15']),
      createCartItem('14', 2),
      createCartItem('20', 2),
    ],
    guestCount: 3,
    guestType: 'regular',
    createdAt: new Date(Date.now() - 50 * 60 * 1000), // 50 mins ago
  },
  {
    tableNumber: 12,
    items: [
      createCartItem('5', 2),
      createCartItem('6', 1),
      createCartItem('13', 1, '', ['ao-19']),
    ],
    guestCount: 2,
    guestType: 'vip',
    createdAt: new Date(Date.now() - 70 * 60 * 1000), // 70 mins ago
  },
];

export const getOrderByTable = (tableNumber: number): TableOrder | undefined => {
  return tableOrders.find(order => order.tableNumber === tableNumber);
};
