import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Plus, Minus, X, Loader2 } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import { useMenuData } from '@/hooks/useMenuData';
import { MenuItem, AddOn } from '@/types/restaurant';
import { ScrollArea } from '@/components/ui/scroll-area';

export const MenuBrowser = () => {
  const {
    setCurrentScreen,
    selectedTable,
    addToCart,
    getCartItemCount,
    setSelectedTable,
  } = useOrder();

  const { menuItems, categories, isLoading, error } = useMenuData();

  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [notes, setNotes] = useState('');

  // Set default category when data loads
  if (categories.length > 0 && !activeCategory) {
    setActiveCategory(categories[0].id);
  }

  const filteredItems = menuItems.filter((item) => item.category === activeCategory);
  const cartCount = getCartItemCount();

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setQuantity(1);
    setSelectedAddOns([]);
    setNotes('');
  };

  const handleAddOnToggle = (addOn: AddOn) => {
    setSelectedAddOns((prev) =>
      prev.find((a) => a.id === addOn.id)
        ? prev.filter((a) => a.id !== addOn.id)
        : [...prev, addOn]
    );
  };

  const handleAddToCart = () => {
    if (selectedItem) {
      addToCart(selectedItem, selectedAddOns, notes, quantity);
      setSelectedItem(null);
    }
  };

  const getItemTotal = () => {
    if (!selectedItem) return 0;
    const addOnsTotal = selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
    return (selectedItem.price + addOnsTotal) * quantity;
  };

  const handleBack = () => {
    setSelectedTable(null);
    setCurrentScreen('tables');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="p-2 rounded-xl bg-secondary touch-target"
            >
              <ArrowLeft className="w-5 h-5 text-secondary-foreground" />
            </motion.button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Meja {selectedTable}</h1>
              <p className="text-xs text-muted-foreground">Pilih menu</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentScreen('cart')}
            className="relative p-3 rounded-xl gradient-primary touch-target shadow-glow"
          >
            <ShoppingCart className="w-5 h-5 text-primary-foreground" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </motion.button>
        </div>

        {/* Category Tabs */}
        {!isLoading && categories.length > 0 && (
          <ScrollArea className="mt-3 -mx-4 px-4">
            <div className="flex gap-2 pb-1 w-max">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all touch-target ${
                    activeCategory === category.id
                      ? 'gradient-primary text-primary-foreground shadow-glow'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.name}
                </motion.button>
              ))}
            </div>
          </ScrollArea>
        )}
      </header>

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-destructive font-medium mb-2">Gagal memuat menu</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Menu Items - List View */}
      {!isLoading && !error && (
        <div className="flex-1 p-4">
          <div className="space-y-2">
            {filteredItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleItemClick(item)}
                className="w-full bg-card rounded-xl p-4 text-left shadow-card hover:shadow-elevated transition-all active:bg-card/80"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                    {item.addOns.length > 0 && (
                      <p className="text-xs text-primary/70 mt-1">
                        +{item.addOns.length} add-on tersedia
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-primary font-bold text-lg">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-card rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">{selectedItem.name}</h2>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-full bg-secondary"
                >
                  <X className="w-5 h-5 text-secondary-foreground" />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <p className="text-muted-foreground">{selectedItem.description}</p>
                <p className="text-xl font-bold text-primary">${selectedItem.price.toFixed(2)}</p>

                {/* Add-ons */}
                {selectedItem.addOns.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Add-ons</h3>
                    <div className="space-y-2">
                      {selectedItem.addOns.map((addOn) => (
                        <motion.button
                          key={addOn.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAddOnToggle(addOn)}
                          className={`w-full p-3 rounded-xl flex items-center justify-between transition-all touch-target ${
                            selectedAddOns.find((a) => a.id === addOn.id)
                              ? 'bg-primary/20 border-2 border-primary'
                              : 'bg-secondary border-2 border-transparent'
                          }`}
                        >
                          <span className="text-foreground">{addOn.name}</span>
                          <span className="text-primary font-semibold">+${addOn.price.toFixed(2)}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Special Instructions</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g., no onions, extra sauce..."
                    className="w-full p-3 rounded-xl bg-secondary border-2 border-transparent focus:border-primary outline-none text-foreground placeholder:text-muted-foreground resize-none"
                    rows={3}
                  />
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Quantity</h3>
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center touch-target"
                    >
                      <Minus className="w-5 h-5 text-secondary-foreground" />
                    </motion.button>
                    <span className="text-xl font-bold text-foreground w-8 text-center">{quantity}</span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center touch-target shadow-glow"
                    >
                      <Plus className="w-5 h-5 text-primary-foreground" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="p-4 border-t border-border">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-bold text-lg shadow-glow touch-target"
                >
                  Add to Cart - ${getItemTotal().toFixed(2)}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
