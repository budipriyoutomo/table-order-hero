// API Branch Menu response type
export interface ApiBranchMenu {
  name: string;
  branch: string;
  brand: string;
  menu_category: string;
  menu_code: string;
  menu_item: string;
  short_name: string;
  rate: number;
  enabled: number;
  sell_item: string;
  recipe_item: string | null;
  default_bom: string | null;
  price_list: string;
  creation: string;
  modified: string;
  modified_by: string;
  owner: string;
  docstatus: number;
  idx: number;
}

// Category extracted from menu data
export interface ApiCategory {
  id: string;
  name: string;
  icon: string;
}

// Map category names to icons
const categoryIcons: Record<string, string> = {
  'Fish': '🐟',
  'Meat': '🥩',
  'Chicken': '🍗',
  'Seafood': '🦐',
  'Vegetables': '🥬',
  'Rice': '🍚',
  'Noodles': '🍜',
  'Soup': '🍲',
  'Appetizers': '🥗',
  'Desserts': '🍰',
  'Drinks': '🥤',
  'Beverages': '☕',
  'Snacks': '🍿',
};

// Get icon for category, with fallback
export const getCategoryIcon = (category: string): string => {
  return categoryIcons[category] || '🍽️';
};

// Extract unique categories from menu items
export const extractCategories = (menuItems: ApiBranchMenu[]): ApiCategory[] => {
  const uniqueCategories = new Set<string>();
  
  menuItems.forEach(item => {
    if (item.menu_category && item.enabled === 1) {
      uniqueCategories.add(item.menu_category);
    }
  });

  return Array.from(uniqueCategories)
    .sort()
    .map(category => ({
      id: category.toLowerCase().replace(/\s+/g, '-'),
      name: category,
      icon: getCategoryIcon(category),
    }));
};
