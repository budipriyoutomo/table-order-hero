export type TableStatus = 'kosong' | 'terisi' | 'disajikan' | 'tagihan';

export interface Table {
  id: string;
  number: number;
  name: string;
  capacity: number;
  status: TableStatus;
}

export const tableStatusLabels: Record<TableStatus, string> = {
  kosong: 'Meja Kosong',
  terisi: 'Meja Terisi',
  disajikan: 'Meja Disajikan',
  tagihan: 'Meja Tagihan',
};

export const tableStatusColors: Record<TableStatus, { bg: string; border: string; text: string }> = {
  kosong: { bg: 'bg-success/20', border: 'border-success/30', text: 'text-success' },
  terisi: { bg: 'bg-destructive/20', border: 'border-destructive/30', text: 'text-destructive' },
  disajikan: { bg: 'bg-primary/20', border: 'border-primary/30', text: 'text-primary' },
  tagihan: { bg: 'bg-warning/20', border: 'border-warning/30', text: 'text-warning' },
};

export const tables: Table[] = [
  { id: 't1', number: 1, name: 'Meja 1', capacity: 2, status: 'kosong' },
  { id: 't2', number: 2, name: 'Meja 2', capacity: 4, status: 'kosong' },
  { id: 't3', number: 3, name: 'Meja 3', capacity: 2, status: 'terisi' },
  { id: 't4', number: 4, name: 'Meja 4', capacity: 6, status: 'kosong' },
  { id: 't5', number: 5, name: 'Meja 5', capacity: 4, status: 'disajikan' },
  { id: 't6', number: 6, name: 'Meja 6', capacity: 2, status: 'kosong' },
  { id: 't7', number: 7, name: 'Meja 7', capacity: 4, status: 'tagihan' },
  { id: 't8', number: 8, name: 'Meja 8', capacity: 6, status: 'terisi' },
  { id: 't9', number: 9, name: 'Meja 9', capacity: 2, status: 'kosong' },
  { id: 't10', number: 10, name: 'Meja 10', capacity: 4, status: 'disajikan' },
  { id: 't11', number: 11, name: 'Meja 11', capacity: 6, status: 'kosong' },
  { id: 't12', number: 12, name: 'Meja 12', capacity: 4, status: 'tagihan' },
];
