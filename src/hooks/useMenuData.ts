import { useState, useEffect } from 'react';
import { MenuItem } from '@/types/restaurant';
import { ApiBranchMenu, extractCategories, getCategoryIcon } from '@/types/menu-api';
import { useOrder } from '@/context/OrderContext';
import { supabase } from '@/integrations/supabase/client';

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

// Transform API menu item to frontend MenuItem
const transformApiMenuItem = (apiItem: ApiBranchMenu): MenuItem => ({
  id: apiItem.name,
  name: apiItem.short_name || apiItem.menu_item.replace(`${apiItem.menu_code}-`, ''),
  description: apiItem.menu_item,
  price: apiItem.rate,
  image: '/placeholder.svg',
  category: apiItem.menu_category.toLowerCase().replace(/\s+/g, '-'),
  addOns: [], // Add-ons will be fetched separately if needed
});

export const useMenuData = (): UseMenuDataReturn => {
  const { currentUser } = useOrder();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!currentUser?.sid) {
      setError('Session tidak ditemukan, silakan login ulang');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.info('Fetching menu data...');
      
      const { data, error: fetchError } = await supabase.functions.invoke('get-menu', {
        body: { sid: currentUser.sid },
      });

      if (fetchError) {
        console.error('Error fetching menu:', fetchError);
        throw new Error(fetchError.message || 'Gagal mengambil data menu');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Gagal mengambil data menu');
      }

      const apiMenuItems: ApiBranchMenu[] = data.menu || [];
      
      // Filter only enabled items
      const enabledItems = apiMenuItems.filter(item => item.enabled === 1);
      
      // Extract categories from menu items
      const extractedCategories = extractCategories(enabledItems);
      setCategories(extractedCategories);
      
      // Transform to frontend format
      const transformedItems = enabledItems.map(transformApiMenuItem);
      setMenuItems(transformedItems);
      
      console.info(`Loaded ${transformedItems.length} menu items in ${extractedCategories.length} categories`);
    } catch (err) {
      console.error('Menu fetch error:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data menu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.sid) {
      fetchData();
    }
  }, [currentUser?.sid]);

  return {
    menuItems,
    categories,
    isLoading,
    error,
    refetch: fetchData,
  };
};
