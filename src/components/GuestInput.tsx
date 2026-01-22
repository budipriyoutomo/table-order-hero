import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Minus, Plus, Check } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import { guestTypes, GuestType } from '@/data/guestTypeData';

export const GuestInput = () => {
  const { setCurrentScreen, selectedTable, setGuestCount, setGuestType } = useOrder();
  const [count, setCount] = useState(1);
  const [selectedGuestType, setSelectedGuestType] = useState<GuestType>(guestTypes[0]);

  const handleConfirm = () => {
    setGuestCount(count);
    setGuestType(selectedGuestType);
    setCurrentScreen('menu');
  };

  const handleBack = () => {
    setCurrentScreen('tables');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="p-2 rounded-xl bg-secondary touch-target"
          >
            <ArrowLeft className="w-5 h-5 text-secondary-foreground" />
          </motion.button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Meja {selectedTable}</h1>
            <p className="text-sm text-muted-foreground">Input informasi tamu</p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-6">
        {/* Guest Count */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Jumlah Tamu
          </h2>
          <div className="flex items-center justify-center gap-6">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setCount((c) => Math.max(1, c - 1))}
              className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center touch-target"
            >
              <Minus className="w-6 h-6 text-secondary-foreground" />
            </motion.button>
            <div className="text-center">
              <span className="text-5xl font-bold text-foreground">{count}</span>
              <p className="text-sm text-muted-foreground mt-1">Orang</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setCount((c) => c + 1)}
              className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center touch-target shadow-glow"
            >
              <Plus className="w-6 h-6 text-primary-foreground" />
            </motion.button>
          </div>
        </div>

        {/* Guest Type */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Tipe Tamu</h2>
          <div className="grid grid-cols-2 gap-3">
            {guestTypes.map((type) => (
              <motion.button
                key={type.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedGuestType(type)}
                className={`p-4 rounded-xl text-left transition-all touch-target ${
                  selectedGuestType.id === type.id
                    ? 'bg-primary/20 border-2 border-primary'
                    : 'bg-secondary border-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{type.icon}</span>
                  {selectedGuestType.id === type.id && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
                <h3 className="font-semibold text-foreground">{type.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="p-4 border-t border-border">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleConfirm}
          className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-bold text-lg shadow-glow touch-target"
        >
          Lanjutkan ke Menu
        </motion.button>
      </div>
    </div>
  );
};
