import { motion } from 'framer-motion';
import { X, ArrowRightLeft, Merge, Split, Clock, Users, ShoppingBag } from 'lucide-react';
import { TableOrder } from '@/data/tableOrdersData';
import { tableStatusLabels, TableStatus } from '@/data/tableData';
import { guestTypes } from '@/data/guestTypeData';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export type TableAction = 'move' | 'join' | 'split' | 'add-more';

interface TableActionsSheetProps {
  order: TableOrder;
  tableNumber: number;
  tableStatus: TableStatus;
  onAction: (action: TableAction) => void;
  onClose: () => void;
}

export const TableActionsSheet = ({
  order,
  tableNumber,
  tableStatus,
  onAction,
  onClose,
}: TableActionsSheetProps) => {
  const guestType = guestTypes.find(g => g.id === order.guestType);
  
  const getItemTotal = (item: typeof order.items[0]) => {
    const addOnsTotal = item.selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
    return (item.menuItem.price + addOnsTotal) * item.quantity;
  };

  const orderTotal = order.items.reduce((sum, item) => sum + getItemTotal(item), 0);

  const actionButtons = [
    {
      id: 'move' as TableAction,
      icon: ArrowRightLeft,
      label: 'Pindah Meja',
      description: 'Pindahkan pesanan ke meja lain',
      color: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    },
    {
      id: 'join' as TableAction,
      icon: Merge,
      label: 'Gabung Meja',
      description: 'Gabungkan dengan pesanan meja lain',
      color: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
    },
    {
      id: 'split' as TableAction,
      icon: Split,
      label: 'Pisah Meja',
      description: 'Pisahkan item ke meja berbeda',
      color: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
    },
  ];

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
        className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col"
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

        {/* Action Buttons */}
        <div className="p-4 space-y-3">
          <p className="text-sm font-medium text-muted-foreground mb-2">Kelola Meja</p>
          <div className="grid grid-cols-1 gap-3">
            {actionButtons.map((action) => (
              <motion.button
                key={action.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAction(action.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${action.color} transition-all`}
              >
                <div className="p-3 rounded-xl bg-background/50">
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-foreground">{action.label}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="flex-1 overflow-y-auto p-4 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">Pesanan ({order.items.length} item)</span>
          </div>

          <div className="space-y-2">
            {order.items.slice(0, 3).map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="flex justify-between items-center bg-secondary/50 rounded-xl p-3"
              >
                <div>
                  <span className="font-medium text-foreground">{item.menuItem.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">x{item.quantity}</span>
                </div>
                <span className="font-semibold text-primary">${getItemTotal(item).toFixed(2)}</span>
              </div>
            ))}
            {order.items.length > 3 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                +{order.items.length - 3} item lainnya
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-muted-foreground">Total Pesanan</span>
            <span className="text-xl font-bold text-primary">${orderTotal.toFixed(2)}</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onAction('add-more')}
            className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-bold text-lg shadow-glow touch-target"
          >
            Tambah Pesanan
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
