// API Table response type
export interface ApiTable {
  id: string;
  name: string;
  status: 'Kosong' | 'Terisi' | 'Has Ordered' | string;
  type: string; // capacity as string
  zone: string;
  customer: string | null;
  pax: number;
  typeCustomer: string | null;
  floor: string;
  takenBy: string | null;
  invoice_name: string | null; // POS Invoice ID for occupied tables
}

// Mapped table type for frontend use
export interface TableData {
  id: string;
  name: string;
  status: 'empty' | 'occupied' | 'ordered' | 'served' | 'billing';
  capacity: number;
  zone: string;
  floor: string;
  customer: string | null;
  pax: number;
  customerType: string | null;
  takenBy: string | null;
  invoiceId: string | null; // POS Invoice ID for occupied tables
}

// Map API status to frontend status
export const mapApiStatusToFrontend = (apiStatus: string): TableData['status'] => {
  switch (apiStatus) {
    case 'Kosong':
      return 'empty';
    case 'Terisi':
      return 'occupied';
    case 'Has Ordered':
      return 'ordered';
    case 'Disajikan':
      return 'served';
    case 'Tagihan':
      return 'billing';
    default:
      return 'empty';
  }
};

// Map frontend status to display label
export const getStatusLabel = (status: TableData['status']): string => {
  switch (status) {
    case 'empty':
      return 'Meja Kosong';
    case 'occupied':
      return 'Meja Terisi';
    case 'ordered':
      return 'Sudah Order';
    case 'served':
      return 'Meja Disajikan';
    case 'billing':
      return 'Meja Tagihan';
    default:
      return 'Unknown';
  }
};

// Transform API table to frontend table
export const transformApiTable = (apiTable: ApiTable): TableData => ({
  id: apiTable.id,
  name: apiTable.name,
  status: mapApiStatusToFrontend(apiTable.status),
  capacity: parseInt(apiTable.type) || 2,
  zone: apiTable.zone,
  floor: apiTable.floor,
  customer: apiTable.customer,
  pax: apiTable.pax,
  customerType: apiTable.typeCustomer,
  takenBy: apiTable.takenBy,
  invoiceId: apiTable.invoice_name || null,
});
