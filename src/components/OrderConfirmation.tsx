import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, ChefHat } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';

export const OrderConfirmation = () => {
  const { selectedTable, cart, getCartTotal, clearCart, setCurrentScreen, setSelectedTable } = useOrder();
  const [orderNumber] = useState(() => Math.floor(1000 + Math.random() * 9000));
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleNewOrder = () => {
    clearCart();
    setCurrentScreen('menu');
  };

  const handleChangeTable = () => {
    clearCart();
    setSelectedTable(null);
    setCurrentScreen('tables');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mb-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <CheckCircle className="w-14 h-14 text-success" />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-foreground text-center mb-2"
      >
        Order Submitted!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground text-center mb-8"
      >
        Your order has been sent to the kitchen
      </motion.p>

      {/* Order Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm bg-card rounded-2xl p-6 shadow-card mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="text-xl font-bold text-foreground">#{orderNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Table</p>
            <p className="text-xl font-bold text-foreground">{selectedTable}</p>
          </div>
        </div>

        <div className="border-t border-border pt-4 mb-4">
          <p className="text-sm text-muted-foreground mb-2">Items ({cart.length})</p>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-foreground">
                  {item.quantity}x {item.menuItem.name}
                </span>
                <span className="text-muted-foreground">
                  ${((item.menuItem.price + item.selectedAddOns.reduce((s, a) => s + a.price, 0)) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-4 flex justify-between items-center">
          <span className="font-semibold text-foreground">Total</span>
          <span className="text-xl font-bold text-primary">${getCartTotal().toFixed(2)}</span>
        </div>
      </motion.div>

      {/* Estimated Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-2 text-muted-foreground mb-8"
      >
        <Clock className="w-5 h-5" />
        <span>Estimated time: 15-20 minutes</span>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-sm space-y-3"
      >
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNewOrder}
          className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-bold text-lg shadow-glow touch-target"
        >
          Add More Items
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleChangeTable}
          className="w-full py-4 rounded-2xl bg-secondary text-secondary-foreground font-bold text-lg touch-target"
        >
          {countdown > 0 ? `Change Table (${countdown}s)` : 'Change Table'}
        </motion.button>
      </motion.div>
    </div>
  );
};
