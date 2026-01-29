import { motion } from 'framer-motion';
import { X, ArrowRightLeft, Merge, Split, Clock, Users, ShoppingBag, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { PosInvoice } from '@/types/pos-invoice-api';

export type TableAction = 'move' | 'join' | 'split' | 'add-more';

type TableStatusDisplay = 'kosong' | 'terisi' | 'sudah_order' | 'disajikan' | 'tagihan';

const tableStatusLabels: Record<TableStatusDisplay, string> = {
  kosong: 'Meja Kosong',
  terisi: 'Meja Terisi',
  sudah_order: 'Sudah Order',
  disajikan: 'Meja Disajikan',
  tagihan: 'Meja Tagihan',
};

interface TableActionsSheetProps {
  invoice: PosInvoice;
  tableNumber: number;
  tableStatus: TableStatusDisplay;
  isLoading?: boolean;
  onAction: (action: TableAction) => void;
  onClose: () => void;
}

export const TableActionsSheet = ({
  invoice,
  tableNumber,
  tableStatus,
  isLoading = false,
  onAction,
  onClose,
}: TableActionsSheetProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: invoice.currency || 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

  // Filter out voided items
  const activeItems = invoice.items.filter(item => item.kitchenStatus !== 'Void Menu');

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

          {/* Customer and Order Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{invoice.customerName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4" />
              <span>{invoice.orderType}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{formatDistanceToNow(new Date(invoice.createdAt), { addSuffix: true, locale: id })}</span>
            </div>
          </div>
          
          {/* Invoice ID */}
          <div className="mt-2 text-xs text-muted-foreground">
            Invoice: {invoice.id}
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
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

            {/* Order Items */}
            <div className="flex-1 overflow-y-auto p-4 border-t border-border">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">
                  Pesanan ({activeItems.length} item, {invoice.totalQty} qty)
                </span>
              </div>

              <div className="space-y-2">
                {activeItems.slice(0, 5).map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex justify-between items-center bg-secondary/50 rounded-xl p-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{item.name}</span>
                        <span className="text-sm text-muted-foreground">x{item.quantity}</span>
                      </div>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.notes}</p>
                      )}
                      <span className={`text-xs ${
                        item.kitchenStatus === 'Already Send To Kitchen' 
                          ? 'text-amber-500' 
                          : item.kitchenStatus === 'Served'
                          ? 'text-success'
                          : 'text-muted-foreground'
                      }`}>
                        {item.kitchenStatus}
                      </span>
                    </div>
                    <span className="font-semibold text-primary">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                {activeItems.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    +{activeItems.length - 5} item lainnya
                  </p>
                )}
              </div>
            </div>

            {/* Footer with Totals */}
            <div className="sticky bottom-0 bg-card border-t border-border p-4">
              {/* Subtotals */}
              <div className="space-y-1 mb-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.taxes.map((tax) => (
                  <div key={tax.id} className="flex justify-between">
                    <span className="text-muted-foreground">{tax.description}</span>
                    <span className="text-foreground">{formatCurrency(tax.amount)}</span>
                  </div>
                ))}
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Diskon</span>
                    <span>-{formatCurrency(invoice.discountAmount)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center mb-3 pt-2 border-t border-border">
                <span className="text-muted-foreground font-medium">Grand Total</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(invoice.grandTotal)}</span>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => onAction('add-more')}
                className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-bold text-lg shadow-glow touch-target"
              >
                Tambah Pesanan
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};
