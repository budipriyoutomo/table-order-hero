import { motion } from 'framer-motion';
import { X, Clock, Users, Plus, ShoppingBag } from 'lucide-react';
import { TableOrder } from '@/data/tableOrdersData';
import { tableStatusLabels, TableStatus } from '@/data/tableData';
import { guestTypes } from '@/data/guestTypeData';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface ExistingOrdersSheetProps {
  order: TableOrder;
  tableNumber: number;
  tableStatus: TableStatus;
  onAddMore: () => void;
  onClose: () => void;
}

export const ExistingOrdersSheet = ({
  order,
  tableNumber,
  tableStatus,
  onAddMore,
  onClose,
}: ExistingOrdersSheetProps) => {
  const guestType = guestTypes.find(g => g.id === order.guestType);
  
  const getItemTotal = (item: typeof order.items[0]) => {
    const addOnsTotal = item.selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
    return (item.menuItem.price + addOnsTotal) * item.quantity;
  };

  const orderTotal = order.items.reduce((sum, item) => sum + getItemTotal(item), 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-foreground">Meja {tableNumber}</h2>
              <p className="text-sm text-primary font-medium">{tableStatusLabels[tableStatus]}</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-xl bg-secondary touch-target"
            >
              <X className="w-5 h-5 text-secondary-foreground" />
            </motion.button>
          </div>

          {/* Guest Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{order.guestCount} Tamu</span>
            </div>
            {guestType && (
              <div className="flex items-center gap-1.5">
                <span>{guestType.icon}</span>
                <span>{guestType.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{formatDistanceToNow(order.createdAt, { addSuffix: true, locale: id })}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">Pesanan Saat Ini</span>
          </div>

          {order.items.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="bg-secondary/50 rounded-xl p-3"
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{item.menuItem.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity}x @ ${item.menuItem.price.toFixed(2)}
                  </p>
                </div>
                <span className="font-semibold text-primary">
                  ${getItemTotal(item).toFixed(2)}
                </span>
              </div>

              {/* Add-ons */}
              {item.selectedAddOns.length > 0 && (
                <div className="mt-1">
                  {item.selectedAddOns.map((addOn) => (
                    <span
                      key={addOn.id}
                      className="inline-block text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full mr-1 mb-1"
                    >
                      + {addOn.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Notes */}
              {item.notes && (
                <p className="text-xs text-muted-foreground italic mt-1 bg-muted/50 p-1.5 rounded">
                  "{item.notes}"
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Pesanan</span>
            <span className="text-xl font-bold text-primary">${orderTotal.toFixed(2)}</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onAddMore}
            className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-bold text-lg shadow-glow touch-target flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Tambah Pesanan
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
