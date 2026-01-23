import { useState, useEffect } from 'react';
import { MenuItem } from '@/types/restaurant';
import { menuItems as staticMenuItems, categories as staticCategories } from '@/data/menuData';

export interface Category {
  id: string;
  name: string;
  icon: string;
}

interface UseMenuDataReturn {
  menuItems: MenuItem[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// This hook is prepared for backend API integration
// Currently uses static data, but can be switched to API calls
export const useMenuData = (): UseMenuDataReturn => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API calls when backend is ready
      // Example API integration:
      // const categoriesRes = await fetch('/api/categories');
      // const menuRes = await fetch('/api/menu-items');
      // const categoriesData = await categoriesRes.json();
      // const menuData = await menuRes.json();
      
      // Simulate API delay for realistic loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Using static data for now
      setCategories(staticCategories);
      setMenuItems(staticMenuItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    menuItems,
    categories,
    isLoading,
    error,
    refetch: fetchData,
  };
};
