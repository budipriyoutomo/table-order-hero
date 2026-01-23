import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, MenuItem, AddOn, AppScreen } from '@/types/restaurant';
import { GuestType, guestTypes } from '@/data/guestTypeData';
import { TableOrder } from '@/data/tableOrdersData';

interface OrderContextType {
  currentScreen: AppScreen;
  setCurrentScreen: (screen: AppScreen) => void;
  selectedTable: number | null;
  setSelectedTable: (table: number | null) => void;
  cart: CartItem[];
  existingOrderItems: CartItem[];
  addToCart: (item: MenuItem, addOns: AddOn[], notes: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getExistingOrderTotal: () => number;
  loadExistingOrder: (order: TableOrder) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  guestCount: number | null;
  setGuestCount: (count: number | null) => void;
  guestType: GuestType | null;
  setGuestType: (type: GuestType | null) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('login');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [existingOrderItems, setExistingOrderItems] = useState<CartItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guestCount, setGuestCount] = useState<number | null>(null);
  const [guestType, setGuestType] = useState<GuestType | null>(null);

  const loadExistingOrder = (order: TableOrder) => {
    setExistingOrderItems(order.items);
    setGuestCount(order.guestCount);
    const foundGuestType = guestTypes.find(g => g.id === order.guestType);
    setGuestType(foundGuestType || null);
    setCart([]); // Clear new items cart when loading existing order
  };

  const getExistingOrderTotal = () => {
    return existingOrderItems.reduce((total, item) => {
      const addOnsTotal = item.selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
      return total + (item.menuItem.price + addOnsTotal) * item.quantity;
    }, 0);
  };

  const addToCart = (item: MenuItem, addOns: AddOn[], notes: string, quantity: number) => {
    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}`,
      menuItem: item,
      quantity,
      selectedAddOns: addOns,
      notes,
    };
    setCart((prev) => [...prev, cartItem]);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateCartItemQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const addOnsTotal = item.selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
      return total + (item.menuItem.price + addOnsTotal) * item.quantity;
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <OrderContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        selectedTable,
        setSelectedTable,
        cart,
        existingOrderItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        getExistingOrderTotal,
        loadExistingOrder,
        isAuthenticated,
        setIsAuthenticated,
        guestCount,
        setGuestCount,
        guestType,
        setGuestType,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
