export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  addOns: AddOn[];
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedAddOns: AddOn[];
  notes: string;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  createdAt: Date;
}

export type AppScreen = 'login' | 'tables' | 'guest-input' | 'menu' | 'cart' | 'confirmation';

// AuthUser no longer contains sensitive credentials - only session ID
export interface AuthUser {
  full_name: string;
  username?: string;
  email?: string;
  sid: string; // Session ID for server-side credential lookup
}
