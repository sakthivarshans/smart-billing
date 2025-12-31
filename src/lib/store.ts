import { create } from 'zustand';

export type BillItem = {
  id: number;
  name: string;
  price: number;
  timestamp: string;
};

type BillState = {
  items: BillItem[];
  whatsappNumber: string;
  total: number;
  addItem: (item: Omit<BillItem, 'id' | 'timestamp'>) => void;
  setWhatsappNumber: (number: string) => void;
  resetBill: () => void;
};

export const useBillStore = create<BillState>((set) => ({
  items: [],
  whatsappNumber: '',
  total: 0,
  addItem: (item) =>
    set((state) => {
      const newItem: BillItem = {
        ...item,
        id: state.items.length + 1,
        timestamp: new Date().toLocaleString(),
      };
      return {
        items: [...state.items, newItem],
        total: state.total + item.price,
      };
    }),
  setWhatsappNumber: (number) => set({ whatsappNumber: number }),
  resetBill: () => set({ items: [], total: 0, whatsappNumber: '' }),
}));
