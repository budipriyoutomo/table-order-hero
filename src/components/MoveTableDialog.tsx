import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Users } from 'lucide-react';
import { tables, tableStatusColors, TableStatus } from '@/data/tableData';
import { TableOrder } from '@/data/tableOrdersData';

interface MoveTableDialogProps {
  order: TableOrder;
  sourceTableNumber: number;
  onConfirm: (targetTableNumber: number) => void;
  onClose: () => void;
}

export const MoveTableDialog = ({
  order,
  sourceTableNumber,
  onConfirm,
  onClose,
}: MoveTableDialogProps) => {
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);

  // Only show empty tables as valid targets
  const availableTables = tables.filter(
    table => table.status === 'kosong' && table.number !== sourceTableNumber
  );

  const handleConfirm = () => {
    if (selectedTarget) {
      onConfirm(selectedTarget);
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
              <h2 className="text-xl font-bold text-foreground">Pindah Meja</h2>
              <p className="text-sm text-muted-foreground">Pilih meja tujuan untuk pesanan</p>
            </div>
          </div>
        </div>

        {/* Transfer Visual */}
        <div className="p-4 flex items-center justify-center gap-4">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-destructive/20 border-2 border-destructive flex items-center justify-center">
              <span className="text-2xl font-bold text-foreground">{sourceTableNumber}</span>
            </div>
            <span className="text-xs text-muted-foreground mt-1">Dari</span>
          </div>
          
          <ArrowRight className="w-8 h-8 text-primary" />
          
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center ${
              selectedTarget 
                ? 'bg-success/20 border-success' 
                : 'bg-secondary border-dashed border-muted-foreground'
            }`}>
              {selectedTarget ? (
                <span className="text-2xl font-bold text-foreground">{selectedTarget}</span>
              ) : (
                <span className="text-lg text-muted-foreground">?</span>
              )}
            </div>
            <span className="text-xs text-muted-foreground mt-1">Ke</span>
          </div>
        </div>

        {/* Available Tables */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Meja Kosong Tersedia ({availableTables.length})
          </p>
          
          {availableTables.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Tidak ada meja kosong tersedia</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {availableTables.map((table) => {
                const isSelected = selectedTarget === table.number;
                const statusStyle = tableStatusColors[table.status];
                
                return (
                  <motion.button
                    key={table.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTarget(table.number)}
                    className={`aspect-square rounded-2xl p-2 flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-primary/20 border-2 border-primary ring-2 ring-primary/30'
                        : `${statusStyle.bg} border-2 ${statusStyle.border}`
                    }`}
                  >
                    <span className="text-xl font-bold text-foreground">{table.number}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{table.capacity}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary mt-1" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            disabled={!selectedTarget}
            className={`w-full py-4 rounded-2xl font-bold text-lg touch-target transition-all ${
              selectedTarget
                ? 'gradient-primary text-primary-foreground shadow-glow'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {selectedTarget 
              ? `Pindahkan ke Meja ${selectedTarget}`
              : 'Pilih Meja Tujuan'
            }
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
