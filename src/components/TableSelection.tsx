import { motion } from 'framer-motion';
import { ArrowLeft, Users } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';

const tables = Array.from({ length: 12 }, (_, i) => ({
  number: i + 1,
  status: i === 2 || i === 7 ? 'occupied' : 'available',
  capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
}));

export const TableSelection = () => {
  const { setCurrentScreen, setSelectedTable, setIsAuthenticated } = useOrder();

  const handleTableSelect = (tableNumber: number) => {
    setSelectedTable(tableNumber);
    setCurrentScreen('menu');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="p-2 rounded-xl bg-secondary touch-target"
          >
            <ArrowLeft className="w-5 h-5 text-secondary-foreground" />
          </motion.button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Select Table</h1>
            <p className="text-sm text-muted-foreground">Choose a table to start taking orders</p>
          </div>
        </div>
      </header>

      {/* Table Grid */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3">
          {tables.map((table, index) => (
            <motion.button
              key={table.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => table.status === 'available' && handleTableSelect(table.number)}
              disabled={table.status === 'occupied'}
              className={`aspect-square rounded-2xl p-3 flex flex-col items-center justify-center transition-all touch-target shadow-card ${
                table.status === 'occupied'
                  ? 'bg-destructive/20 border-2 border-destructive/30 opacity-60 cursor-not-allowed'
                  : 'bg-card border-2 border-transparent hover:border-primary hover:shadow-glow active:bg-card-elevated'
              }`}
            >
              <span className="text-3xl font-bold text-foreground">{table.number}</span>
              <div className="flex items-center gap-1 mt-2">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{table.capacity}</span>
              </div>
              <span
                className={`text-xs mt-1 font-medium ${
                  table.status === 'occupied' ? 'text-destructive' : 'text-success'
                }`}
              >
                {table.status === 'occupied' ? 'Occupied' : 'Available'}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-6">
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success/30 border border-success" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive/30 border border-destructive" />
            <span className="text-muted-foreground">Occupied</span>
          </div>
        </div>
      </div>
    </div>
  );
};
