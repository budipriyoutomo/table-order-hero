import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Users, Split, Plus, Minus } from 'lucide-react';
import { tables, tableStatusColors } from '@/data/tableData';
import { TableOrder } from '@/data/tableOrdersData';
import { CartItem } from '@/types/restaurant';

interface SplitTableDialogProps {
  order: TableOrder;
  sourceTableNumber: number;
  onConfirm: (splitData: { targetTable: number; items: CartItem[] }[]) => void;
  onClose: () => void;
}

export const SplitTableDialog = ({
  order,
  sourceTableNumber,
  onConfirm,
  onClose,
}: SplitTableDialogProps) => {
  const [selectedTargetTable, setSelectedTargetTable] = useState<number | null>(null);
  const [itemsToSplit, setItemsToSplit] = useState<Map<string, number>>(new Map());

  // Only show empty tables as valid targets
  const availableTables = tables.filter(
    table => table.status === 'kosong' && table.number !== sourceTableNumber
  );

  const toggleItemForSplit = (itemId: string, maxQuantity: number) => {
    setItemsToSplit(prev => {
      const newMap = new Map(prev);
      const currentQty = newMap.get(itemId) || 0;
      
      if (currentQty === 0) {
        newMap.set(itemId, 1);
      } else if (currentQty < maxQuantity) {
        newMap.set(itemId, currentQty + 1);
      } else {
        newMap.delete(itemId);
      }
      
      return newMap;
    });
  };

  const adjustSplitQuantity = (itemId: string, delta: number, maxQuantity: number) => {
    setItemsToSplit(prev => {
      const newMap = new Map(prev);
      const currentQty = newMap.get(itemId) || 0;
      const newQty = Math.max(0, Math.min(maxQuantity, currentQty + delta));
      
      if (newQty === 0) {
        newMap.delete(itemId);
      } else {
        newMap.set(itemId, newQty);
      }
      
      return newMap;
    });
  };

  const getItemTotal = (item: CartItem) => {
    const addOnsTotal = item.selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
    return (item.menuItem.price + addOnsTotal) * item.quantity;
  };

  const getSplitItemTotal = (item: CartItem) => {
    const splitQty = itemsToSplit.get(item.id) || 0;
    const addOnsTotal = item.selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
    return (item.menuItem.price + addOnsTotal) * splitQty;
  };

  const totalSplitAmount = order.items.reduce((sum, item) => sum + getSplitItemTotal(item), 0);
  const totalSplitItems = Array.from(itemsToSplit.values()).reduce((sum, qty) => sum + qty, 0);

  const handleConfirm = () => {
    if (selectedTargetTable && itemsToSplit.size > 0) {
      const splitItems: CartItem[] = order.items
        .filter(item => itemsToSplit.has(item.id))
        .map(item => ({
          ...item,
          quantity: itemsToSplit.get(item.id)!,
        }));

      onConfirm([{ targetTable: selectedTargetTable, items: splitItems }]);
    }
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
        className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col"
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
              <h2 className="text-xl font-bold text-foreground">Pisah Meja</h2>
              <p className="text-sm text-muted-foreground">Pilih item dan meja tujuan</p>
            </div>
          </div>
        </div>

        {/* Step 1: Select Target Table */}
        <div className="p-4 border-b border-border">
          <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">1</span>
            Pilih Meja Tujuan
          </p>
          
          {availableTables.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada meja kosong tersedia</p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {availableTables.map((table) => {
                const isSelected = selectedTargetTable === table.number;
                const statusStyle = tableStatusColors[table.status];
                
                return (
                  <motion.button
                    key={table.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTargetTable(table.number)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-primary/20 border-2 border-primary'
                        : `${statusStyle.bg} border-2 ${statusStyle.border}`
                    }`}
                  >
                    <span className="text-lg font-bold text-foreground">{table.number}</span>
                    <div className="flex items-center gap-0.5">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{table.capacity}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 2: Select Items to Split */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">2</span>
            Pilih Item untuk Dipindahkan
          </p>
          
          <div className="space-y-3">
            {order.items.map((item, index) => {
              const splitQty = itemsToSplit.get(item.id) || 0;
              const isSelected = splitQty > 0;
              
              return (
                <div
                  key={`${item.id}-${index}`}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? 'bg-orange-500/10 border-orange-500'
                      : 'bg-secondary/50 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{item.menuItem.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${item.menuItem.price.toFixed(2)} • Total: {item.quantity}x
                      </p>
                    </div>
                    <span className="font-semibold text-primary">${getItemTotal(item).toFixed(2)}</span>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground">
                      Pindahkan:
                    </span>
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => adjustSplitQuantity(item.id, -1, item.quantity)}
                        disabled={splitQty === 0}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          splitQty === 0 ? 'bg-muted text-muted-foreground' : 'bg-secondary text-foreground'
                        }`}
                      >
                        <Minus className="w-4 h-4" />
                      </motion.button>
                      
                      <span className={`w-8 text-center font-bold ${
                        splitQty > 0 ? 'text-orange-500' : 'text-muted-foreground'
                      }`}>
                        {splitQty}
                      </span>
                      
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => adjustSplitQuantity(item.id, 1, item.quantity)}
                        disabled={splitQty >= item.quantity}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          splitQty >= item.quantity ? 'bg-muted text-muted-foreground' : 'bg-secondary text-foreground'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-2 text-right">
                      <span className="text-sm text-orange-500 font-medium">
                        Dipindahkan: ${getSplitItemTotal(item).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        {totalSplitItems > 0 && selectedTargetTable && (
          <div className="px-4 py-3 bg-orange-500/10 border-t border-orange-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Split className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-orange-500 font-medium">
                  {totalSplitItems} item → Meja {selectedTargetTable}
                </span>
              </div>
              <span className="font-bold text-orange-500">${totalSplitAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            disabled={!selectedTargetTable || itemsToSplit.size === 0}
            className={`w-full py-4 rounded-2xl font-bold text-lg touch-target transition-all ${
              selectedTargetTable && itemsToSplit.size > 0
                ? 'gradient-primary text-primary-foreground shadow-glow'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {selectedTargetTable && itemsToSplit.size > 0
              ? `Pisahkan ke Meja ${selectedTargetTable}`
              : 'Pilih Meja & Item'
            }
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
