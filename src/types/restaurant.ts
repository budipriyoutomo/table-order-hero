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

export interface AuthUser {
  full_name: string;
  username?: string;
  email?: string;
  api_key?: string;
  api_secret?: string;
  sid?: string;
}
