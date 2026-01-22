import { OrderProvider, useOrder } from '@/context/OrderContext';
import { PinLogin } from '@/components/PinLogin';
import { TableSelection } from '@/components/TableSelection';
import { GuestInput } from '@/components/GuestInput';
import { MenuBrowser } from '@/components/MenuBrowser';
import { Cart } from '@/components/Cart';
import { OrderConfirmation } from '@/components/OrderConfirmation';
import { AnimatePresence, motion } from 'framer-motion';

const ScreenRouter = () => {
  const { currentScreen } = useOrder();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentScreen}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="min-h-screen"
      >
        {currentScreen === 'login' && <PinLogin />}
        {currentScreen === 'tables' && <TableSelection />}
        {currentScreen === 'guest-input' && <GuestInput />}
        {currentScreen === 'menu' && <MenuBrowser />}
        {currentScreen === 'cart' && <Cart />}
        {currentScreen === 'confirmation' && <OrderConfirmation />}
      </motion.div>
    </AnimatePresence>
  );
};

const Index = () => {
  return (
    <OrderProvider>
      <div className="min-h-screen bg-background">
        <ScreenRouter />
      </div>
    </OrderProvider>
  );
};

export default Index;
