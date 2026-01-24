import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Filter, RefreshCw, Loader2 } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import { getOrderByTable, TableOrder } from '@/data/tableOrdersData';
import { TableActionsSheet, TableAction } from './TableActionsSheet';
import { MoveTableDialog } from './MoveTableDialog';
import { JoinTableDialog } from './JoinTableDialog';
import { SplitTableDialog } from './SplitTableDialog';
import { CartItem } from '@/types/restaurant';
import { toast } from '@/hooks/use-toast';
import { useTablesData } from '@/hooks/useTablesData';
import { TableData, getStatusLabel } from '@/types/api';

type FilterOption = 'all' | TableData['status'];

type ActiveDialog = 'actions' | 'move' | 'join' | 'split' | null;

const filterOptions: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'Semua Meja' },
  { value: 'empty', label: 'Meja Kosong' },
  { value: 'occupied', label: 'Meja Terisi' },
  { value: 'ordered', label: 'Sudah Order' },
  { value: 'served', label: 'Meja Disajikan' },
  { value: 'billing', label: 'Meja Tagihan' },
];

const getStatusColors = (status: TableData['status']) => {
  switch (status) {
    case 'empty':
      return { bg: 'bg-success/20', border: 'border-success', text: 'text-success' };
    case 'occupied':
      return { bg: 'bg-destructive/20', border: 'border-destructive', text: 'text-destructive' };
    case 'ordered':
      return { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-500' };
    case 'served':
      return { bg: 'bg-primary/20', border: 'border-primary', text: 'text-primary' };
    case 'billing':
      return { bg: 'bg-warning/20', border: 'border-warning', text: 'text-warning' };
    default:
      return { bg: 'bg-muted', border: 'border-border', text: 'text-muted-foreground' };
  }
};

export const TableSelection = () => {
  const { setCurrentScreen, setSelectedTable, logout, loadExistingOrder, currentUser } = useOrder();
  const { tables, isLoading, error, refetch } = useTablesData();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [selectedOrderData, setSelectedOrderData] = useState<{
    order: TableOrder;
    tableId: string;
    tableName: string;
    tableStatus: TableData['status'];
  } | null>(null);

  // Group tables by zone/floor
  const groupedTables = useMemo(() => {
    const filtered = activeFilter === 'all'
      ? tables
      : tables.filter(table => table.status === activeFilter);
    
    return filtered.reduce((acc, table) => {
      const key = `${table.floor} - ${table.zone}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(table);
      return acc;
    }, {} as Record<string, TableData[]>);
  }, [tables, activeFilter]);

  const handleTableSelect = (table: TableData) => {
    if (table.status === 'empty') {
      setSelectedTable(parseInt(table.id) || 0);
      setCurrentScreen('guest-input');
    } else {
      // Show table actions sheet for occupied tables
      const existingOrder = getOrderByTable(parseInt(table.id) || 1);
      if (existingOrder) {
        setSelectedOrderData({
          order: existingOrder,
          tableId: table.id,
          tableName: table.name,
          tableStatus: table.status,
        });
        setActiveDialog('actions');
      } else {
        // No existing order, go directly to menu
        setSelectedTable(parseInt(table.id) || 0);
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
      toast({
        title: "Meja Dipindahkan",
        description: `Pesanan dari Meja ${selectedOrderData.tableName} dipindahkan ke Meja ${targetTableNumber}`,
      });
      closeDialog();
      refetch();
    }
  };

  const handleJoinTables = (targetTableNumbers: number[]) => {
    if (selectedOrderData) {
      toast({
        title: "Meja Digabungkan",
        description: `Meja ${selectedOrderData.tableName} digabungkan dengan Meja ${targetTableNumbers.join(', ')}`,
      });
      closeDialog();
      refetch();
    }
  };

  const handleSplitTable = (splitData: { targetTable: number; items: CartItem[] }[]) => {
    if (selectedOrderData && splitData.length > 0) {
      const targetTable = splitData[0].targetTable;
      const itemCount = splitData[0].items.reduce((sum, item) => sum + item.quantity, 0);
      toast({
        title: "Meja Dipisahkan",
        description: `${itemCount} item dipindahkan dari Meja ${selectedOrderData.tableName} ke Meja ${targetTable}`,
      });
      closeDialog();
      refetch();
    }
  };

  const handleAddMoreItems = () => {
    if (selectedOrderData) {
      setSelectedTable(parseInt(selectedOrderData.tableId) || 0);
      loadExistingOrder(selectedOrderData.order);
      closeDialog();
      setCurrentScreen('menu');
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
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
              <p className="text-sm text-muted-foreground">
                {currentUser?.full_name ? `Hi, ${currentUser.full_name}` : 'Pilih meja untuk memulai pesanan'}
              </p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={refetch}
            disabled={isLoading}
            className="p-2 rounded-xl bg-secondary touch-target disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-secondary-foreground animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5 text-secondary-foreground" />
            )}
          </motion.button>
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

      {/* Error State */}
      {error && (
        <div className="px-4 py-6 text-center">
          <p className="text-destructive mb-2">{error}</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={refetch}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Coba Lagi
          </motion.button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && tables.length === 0 && (
        <div className="px-4 py-12 text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Memuat data meja...</p>
        </div>
      )}

      {/* Table Grid by Zone */}
      {!error && !isLoading && (
        <div className="p-4 space-y-6">
          {Object.keys(groupedTables).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Tidak ada meja dengan status ini</p>
            </div>
          ) : (
            Object.entries(groupedTables).map(([zone, zoneTables]) => (
              <div key={zone}>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3">{zone}</h2>
                <div className="grid grid-cols-3 gap-3">
                  {zoneTables.map((table, index) => {
                    const statusStyle = getStatusColors(table.status);
                    
                    return (
                      <motion.button
                        key={table.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleTableSelect(table)}
                        className={`aspect-square rounded-2xl p-3 flex flex-col items-center justify-center transition-all touch-target shadow-card ${statusStyle.bg} border-2 ${statusStyle.border} hover:shadow-glow active:scale-95`}
                      >
                        <span className="text-xl font-bold text-foreground">{table.name}</span>
                        <div className="flex items-center gap-1 mt-1">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {table.pax > 0 ? `${table.pax}/${table.capacity}` : table.capacity}
                          </span>
                        </div>
                        <span className={`text-xs mt-1 font-medium ${statusStyle.text}`}>
                          {getStatusLabel(table.status)}
                        </span>
                        {table.customer && (
                          <span className="text-xs text-muted-foreground truncate max-w-full">
                            {table.customer}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

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
            <div className="w-4 h-4 rounded bg-amber-500/30 border border-amber-500" />
            <span className="text-muted-foreground">Sudah Order</span>
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
            tableNumber={parseInt(selectedOrderData.tableId) || 0}
            tableStatus={selectedOrderData.tableStatus === 'empty' ? 'kosong' : 
                        selectedOrderData.tableStatus === 'occupied' ? 'terisi' :
                        selectedOrderData.tableStatus === 'served' ? 'disajikan' :
                        selectedOrderData.tableStatus === 'billing' ? 'tagihan' : 'terisi'}
            onAction={handleTableAction}
            onClose={closeDialog}
          />
        )}

        {activeDialog === 'move' && selectedOrderData && (
          <MoveTableDialog
            order={selectedOrderData.order}
            sourceTableNumber={parseInt(selectedOrderData.tableId) || 0}
            onConfirm={handleMoveTable}
            onClose={() => setActiveDialog('actions')}
          />
        )}

        {activeDialog === 'join' && selectedOrderData && (
          <JoinTableDialog
            order={selectedOrderData.order}
            sourceTableNumber={parseInt(selectedOrderData.tableId) || 0}
            onConfirm={handleJoinTables}
            onClose={() => setActiveDialog('actions')}
          />
        )}

        {activeDialog === 'split' && selectedOrderData && (
          <SplitTableDialog
            order={selectedOrderData.order}
            sourceTableNumber={parseInt(selectedOrderData.tableId) || 0}
            onConfirm={handleSplitTable}
            onClose={() => setActiveDialog('actions')}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
