import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Users, Merge } from 'lucide-react';
import { tables, tableStatusColors, TableStatus } from '@/data/tableData';
import { TableOrder, getOrderByTable } from '@/data/tableOrdersData';

interface JoinTableDialogProps {
  order: TableOrder;
  sourceTableNumber: number;
  onConfirm: (targetTableNumbers: number[]) => void;
  onClose: () => void;
}

export const JoinTableDialog = ({
  order,
  sourceTableNumber,
  onConfirm,
  onClose,
}: JoinTableDialogProps) => {
  const [selectedTables, setSelectedTables] = useState<number[]>([]);

  // Only show occupied tables (terisi, disajikan, tagihan) as valid targets
  const availableTables = tables.filter(
    table => table.status !== 'kosong' && table.number !== sourceTableNumber
  );

  const toggleTableSelection = (tableNumber: number) => {
    setSelectedTables(prev => 
      prev.includes(tableNumber)
        ? prev.filter(n => n !== tableNumber)
        : [...prev, tableNumber]
    );
  };

  const handleConfirm = () => {
    if (selectedTables.length > 0) {
      onConfirm(selectedTables);
    }
  };

  const getTableOrderInfo = (tableNumber: number) => {
    const order = getOrderByTable(tableNumber);
    if (!order) return null;
    
    const total = order.items.reduce((sum, item) => {
      const addOnsTotal = item.selectedAddOns.reduce((s, a) => s + a.price, 0);
      return sum + (item.menuItem.price + addOnsTotal) * item.quantity;
    }, 0);
    
    return { itemCount: order.items.length, total, guestCount: order.guestCount };
  };

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
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 rounded-xl bg-secondary touch-target"
            >
              <ArrowLeft className="w-5 h-5 text-secondary-foreground" />
            </motion.button>
            <div>
              <h2 className="text-xl font-bold text-foreground">Gabung Meja</h2>
              <p className="text-sm text-muted-foreground">Pilih meja untuk digabungkan</p>
            </div>
          </div>
        </div>

        {/* Source Table Info */}
        <div className="p-4 bg-secondary/30 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border-2 border-primary flex items-center justify-center">
              <span className="text-lg font-bold text-foreground">{sourceTableNumber}</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Meja {sourceTableNumber} (Utama)</p>
              <p className="text-sm text-muted-foreground">
                {order.items.length} item • {order.guestCount} tamu
              </p>
            </div>
            <Merge className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* Available Tables */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Meja dengan Pesanan ({availableTables.length})
          </p>
          
          {availableTables.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Tidak ada meja dengan pesanan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableTables.map((table) => {
                const isSelected = selectedTables.includes(table.number);
                const statusStyle = tableStatusColors[table.status];
                const orderInfo = getTableOrderInfo(table.number);
                
                return (
                  <motion.button
                    key={table.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleTableSelection(table.number)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                      isSelected
                        ? 'bg-primary/20 border-primary ring-2 ring-primary/30'
                        : `${statusStyle.bg} ${statusStyle.border}`
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-background/50'
                    }`}>
                      {isSelected ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <span className="text-lg font-bold">{table.number}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">Meja {table.number}</p>
                      {orderInfo && (
                        <p className="text-sm text-muted-foreground">
                          {orderInfo.itemCount} item • {orderInfo.guestCount} tamu • ${orderInfo.total.toFixed(2)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{table.capacity}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Summary */}
        {selectedTables.length > 0 && (
          <div className="px-4 py-3 bg-primary/10 border-t border-primary/20">
            <p className="text-sm text-primary font-medium text-center">
              Gabungkan Meja {sourceTableNumber} dengan Meja {selectedTables.join(', ')}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            disabled={selectedTables.length === 0}
            className={`w-full py-4 rounded-2xl font-bold text-lg touch-target transition-all ${
              selectedTables.length > 0
                ? 'gradient-primary text-primary-foreground shadow-glow'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {selectedTables.length > 0
              ? `Gabungkan ${selectedTables.length + 1} Meja`
              : 'Pilih Meja untuk Digabung'
            }
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
