import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Filter } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import { tables, tableStatusLabels, tableStatusColors, TableStatus } from '@/data/tableData';
import { getOrderByTable, TableOrder } from '@/data/tableOrdersData';
import { TableActionsSheet, TableAction } from './TableActionsSheet';
import { MoveTableDialog } from './MoveTableDialog';
import { JoinTableDialog } from './JoinTableDialog';
import { SplitTableDialog } from './SplitTableDialog';
import { CartItem } from '@/types/restaurant';
import { toast } from '@/hooks/use-toast';

type FilterOption = 'all' | TableStatus;

type ActiveDialog = 'actions' | 'move' | 'join' | 'split' | null;

const filterOptions: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'Semua Meja' },
  { value: 'kosong', label: 'Meja Kosong' },
  { value: 'terisi', label: 'Meja Terisi' },
  { value: 'disajikan', label: 'Meja Disajikan' },
  { value: 'tagihan', label: 'Meja Tagihan' },
];

export const TableSelection = () => {
  const { setCurrentScreen, setSelectedTable, setIsAuthenticated, loadExistingOrder } = useOrder();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [selectedOrderData, setSelectedOrderData] = useState<{
    order: TableOrder;
    tableNumber: number;
    tableStatus: TableStatus;
  } | null>(null);

  const filteredTables = activeFilter === 'all'
    ? tables 
    : tables.filter(table => table.status === activeFilter);

  const handleTableSelect = (tableNumber: number, tableStatus: TableStatus) => {
    if (tableStatus === 'kosong') {
      setSelectedTable(tableNumber);
      setCurrentScreen('guest-input');
    } else {
      // Show table actions sheet for occupied tables
      const existingOrder = getOrderByTable(tableNumber);
      if (existingOrder) {
        setSelectedOrderData({
          order: existingOrder,
          tableNumber,
          tableStatus,
        });
        setActiveDialog('actions');
      } else {
        // No existing order, go directly to menu
        setSelectedTable(tableNumber);
        setCurrentScreen('menu');
      }
    }
  };

  const handleTableAction = (action: TableAction) => {
    if (action === 'add-more') {
      handleAddMoreItems();
    } else {
      setActiveDialog(action);
    }
  };

  const closeDialog = () => {
    setActiveDialog(null);
    setSelectedOrderData(null);
  };

  const handleMoveTable = (targetTableNumber: number) => {
    if (selectedOrderData) {
      // In a real app, this would update the backend
      toast({
        title: "Meja Dipindahkan",
        description: `Pesanan dari Meja ${selectedOrderData.tableNumber} dipindahkan ke Meja ${targetTableNumber}`,
      });
      closeDialog();
    }
  };

  const handleJoinTables = (targetTableNumbers: number[]) => {
    if (selectedOrderData) {
      // In a real app, this would merge orders in the backend
      toast({
        title: "Meja Digabungkan",
        description: `Meja ${selectedOrderData.tableNumber} digabungkan dengan Meja ${targetTableNumbers.join(', ')}`,
      });
      closeDialog();
    }
  };

  const handleSplitTable = (splitData: { targetTable: number; items: CartItem[] }[]) => {
    if (selectedOrderData && splitData.length > 0) {
      // In a real app, this would split order in the backend
      const targetTable = splitData[0].targetTable;
      const itemCount = splitData[0].items.reduce((sum, item) => sum + item.quantity, 0);
      toast({
        title: "Meja Dipisahkan",
        description: `${itemCount} item dipindahkan dari Meja ${selectedOrderData.tableNumber} ke Meja ${targetTable}`,
      });
      closeDialog();
    }
  };

  const handleAddMoreItems = () => {
    if (selectedOrderData) {
      setSelectedTable(selectedOrderData.tableNumber);
      loadExistingOrder(selectedOrderData.order);
      closeDialog();
      setCurrentScreen('menu');
    }
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
              
              return (
                <motion.button
                  key={table.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTableSelect(table.number, table.status)}
                  className={`aspect-square rounded-2xl p-3 flex flex-col items-center justify-center transition-all touch-target shadow-card ${statusStyle.bg} border-2 ${statusStyle.border} hover:shadow-glow active:scale-95`}
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

      {/* Table Actions Sheet */}
      <AnimatePresence>
        {activeDialog === 'actions' && selectedOrderData && (
          <TableActionsSheet
            order={selectedOrderData.order}
            tableNumber={selectedOrderData.tableNumber}
            tableStatus={selectedOrderData.tableStatus}
            onAction={handleTableAction}
            onClose={closeDialog}
          />
        )}

        {activeDialog === 'move' && selectedOrderData && (
          <MoveTableDialog
            order={selectedOrderData.order}
            sourceTableNumber={selectedOrderData.tableNumber}
            onConfirm={handleMoveTable}
            onClose={() => setActiveDialog('actions')}
          />
        )}

        {activeDialog === 'join' && selectedOrderData && (
          <JoinTableDialog
            order={selectedOrderData.order}
            sourceTableNumber={selectedOrderData.tableNumber}
            onConfirm={handleJoinTables}
            onClose={() => setActiveDialog('actions')}
          />
        )}

        {activeDialog === 'split' && selectedOrderData && (
          <SplitTableDialog
            order={selectedOrderData.order}
            sourceTableNumber={selectedOrderData.tableNumber}
            onConfirm={handleSplitTable}
            onClose={() => setActiveDialog('actions')}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
