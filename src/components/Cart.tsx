import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, History } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';

export const Cart = () => {
  const {
    setCurrentScreen,
    selectedTable,
    cart,
    existingOrderItems,
    removeFromCart,
    updateCartItemQuantity,
    getCartTotal,
    getExistingOrderTotal,
  } = useOrder();

  const handleSubmitOrder = () => {
    if (cart.length > 0) {
      setCurrentScreen('confirmation');
    }
  };

  const getItemTotal = (item: typeof cart[0]) => {
    const addOnsTotal = item.selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
    return (item.menuItem.price + addOnsTotal) * item.quantity;
  };

  const grandTotal = getCartTotal() + getExistingOrderTotal();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentScreen('menu')}
            className="p-2 rounded-xl bg-secondary touch-target"
          >
            <ArrowLeft className="w-5 h-5 text-secondary-foreground" />
          </motion.button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Your Order</h1>
            <p className="text-sm text-muted-foreground">Table {selectedTable}</p>
          </div>
        </div>
      </header>

      {/* Existing Order Items */}
      <div className="flex-1 p-4 space-y-4">
        {existingOrderItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <History className="w-4 h-4" />
              <span className="text-sm font-medium">Pesanan Sebelumnya</span>
            </div>
            {existingOrderItems.map((item, index) => (
              <div
                key={`existing-${item.id}-${index}`}
                className="bg-secondary/30 rounded-2xl p-4 border border-border/50"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.menuItem.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity}x @ ${item.menuItem.price.toFixed(2)}
                    </p>
                  </div>
                  <span className="font-semibold text-muted-foreground">
                    ${getItemTotal(item).toFixed(2)}
                  </span>
                </div>

                {/* Add-ons */}
                {item.selectedAddOns.length > 0 && (
                  <div className="mb-2">
                    {item.selectedAddOns.map((addOn) => (
                      <span
                        key={addOn.id}
                        className="inline-block text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full mr-1 mb-1"
                      >
                        + {addOn.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {item.notes && (
                  <p className="text-xs text-muted-foreground italic bg-muted/50 p-2 rounded-lg">
                    "{item.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* New Cart Items */}
        {cart.length === 0 && existingOrderItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-64 text-center"
          >
            <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground">Add some delicious items from the menu</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentScreen('menu')}
              className="mt-4 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold touch-target shadow-glow"
            >
              Browse Menu
            </motion.button>
          </motion.div>
        ) : cart.length > 0 && (
          <div className="space-y-3">
            {existingOrderItems.length > 0 && (
              <div className="flex items-center gap-2 text-primary">
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Pesanan Tambahan</span>
              </div>
            )}
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  layout
                  className="bg-card rounded-2xl p-4 shadow-card"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{item.menuItem.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ${item.menuItem.price.toFixed(2)} each
                      </p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 rounded-lg bg-destructive/20 text-destructive touch-target"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Add-ons */}
                  {item.selectedAddOns.length > 0 && (
                    <div className="mb-2">
                      {item.selectedAddOns.map((addOn) => (
                        <span
                          key={addOn.id}
                          className="inline-block text-xs bg-primary/20 text-primary px-2 py-1 rounded-full mr-1 mb-1"
                        >
                          + {addOn.name} (${addOn.price.toFixed(2)})
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {item.notes && (
                    <p className="text-xs text-muted-foreground italic mb-3 bg-muted/50 p-2 rounded-lg">
                      "{item.notes}"
                    </p>
                  )}

                  {/* Quantity & Total */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center touch-target"
                      >
                        <Minus className="w-4 h-4 text-secondary-foreground" />
                      </motion.button>
                      <span className="font-semibold text-foreground w-6 text-center">
                        {item.quantity}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center touch-target"
                      >
                        <Plus className="w-4 h-4 text-primary-foreground" />
                      </motion.button>
                    </div>
                    <span className="font-bold text-primary text-lg">
                      ${getItemTotal(item).toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Order Summary & Submit */}
      {(cart.length > 0 || existingOrderItems.length > 0) && (
        <div className="sticky bottom-0 bg-card border-t border-border p-4 space-y-3">
          {existingOrderItems.length > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Pesanan Sebelumnya</span>
              <span className="text-muted-foreground">${getExistingOrderTotal().toFixed(2)}</span>
            </div>
          )}
          {cart.length > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Pesanan Baru</span>
              <span className="text-foreground font-semibold">${getCartTotal().toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="text-lg font-bold text-foreground">Grand Total</span>
            <span className="text-2xl font-bold text-primary">${grandTotal.toFixed(2)}</span>
          </div>
          {cart.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmitOrder}
              className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-bold text-lg shadow-glow touch-target"
            >
              Submit Pesanan Baru
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};
