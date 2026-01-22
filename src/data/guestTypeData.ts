export interface GuestType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const guestTypes: GuestType[] = [
  {
    id: 'regular',
    name: 'Regular',
    description: 'Tamu biasa',
    icon: '👤',
  },
  {
    id: 'vip',
    name: 'VIP',
    description: 'Tamu prioritas',
    icon: '⭐',
  },
  {
    id: 'member',
    name: 'Member',
    description: 'Anggota terdaftar',
    icon: '💳',
  },
  {
    id: 'family',
    name: 'Keluarga',
    description: 'Tamu keluarga',
    icon: '👨‍👩‍👧‍👦',
  },
  {
    id: 'business',
    name: 'Bisnis',
    description: 'Pertemuan bisnis',
    icon: '💼',
  },
  {
    id: 'celebration',
    name: 'Perayaan',
    description: 'Ulang tahun, anniversary',
    icon: '🎉',
  },
];
