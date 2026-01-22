import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Filter } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import { tables, tableStatusLabels, tableStatusColors, TableStatus } from '@/data/tableData';

type FilterOption = 'all' | TableStatus;

const filterOptions: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'Semua Meja' },
  { value: 'kosong', label: 'Meja Kosong' },
  { value: 'terisi', label: 'Meja Terisi' },
  { value: 'disajikan', label: 'Meja Disajikan' },
  { value: 'tagihan', label: 'Meja Tagihan' },
];

export const TableSelection = () => {
  const { setCurrentScreen, setSelectedTable, setIsAuthenticated } = useOrder();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

  const filteredTables = activeFilter === 'all' 
    ? tables 
    : tables.filter(table => table.status === activeFilter);

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
            <h1 className="text-xl font-bold text-foreground">Pilih Meja</h1>
            <p className="text-sm text-muted-foreground">Pilih meja untuk memulai pesanan</p>
          </div>
        </div>
      </header>

      {/* Status Filter */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filter Status</span>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {filterOptions.map((option) => (
            <motion.button
              key={option.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(option.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Table Grid */}
      <div className="p-4">
        {filteredTables.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Tidak ada meja dengan status ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filteredTables.map((table, index) => {
              const statusStyle = tableStatusColors[table.status];
              const isSelectable = table.status === 'kosong';
              
              return (
                <motion.button
                  key={table.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => isSelectable && handleTableSelect(table.number)}
                  disabled={!isSelectable}
                  className={`aspect-square rounded-2xl p-3 flex flex-col items-center justify-center transition-all touch-target shadow-card ${
                    !isSelectable
                      ? `${statusStyle.bg} border-2 ${statusStyle.border} opacity-70 cursor-not-allowed`
                      : 'bg-card border-2 border-transparent hover:border-primary hover:shadow-glow active:bg-card-elevated'
                  }`}
                >
                  <span className="text-2xl font-bold text-foreground">{table.number}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">{table.name}</span>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{table.capacity}</span>
                  </div>
                  <span className={`text-xs mt-1 font-medium ${statusStyle.text}`}>
                    {tableStatusLabels[table.status]}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-4 pb-6">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success/30 border border-success" />
            <span className="text-muted-foreground">Kosong</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive/30 border border-destructive" />
            <span className="text-muted-foreground">Terisi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/30 border border-primary" />
            <span className="text-muted-foreground">Disajikan</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-warning/30 border border-warning" />
            <span className="text-muted-foreground">Tagihan</span>
          </div>
        </div>
      </div>
    </div>
  );
};
