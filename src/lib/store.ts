import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'

export type BillItem = {
  id: number;
  name: string;
  price: number;
  timestamp: string;
  rfid: string;
};

type BillState = {
  items: BillItem[];
  phoneNumber: string;
  total: number;
  addItem: (item: Omit<BillItem, 'id' | 'timestamp'>) => void;
  setPhoneNumber: (number: string) => void;
  resetBill: () => void;
};

export const useBillStore = create<BillState>((set) => ({
  items: [],
  phoneNumber: '',
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
  setPhoneNumber: (number) => set({ phoneNumber: number }),
  resetBill: () => set({ items: [], total: 0, phoneNumber: '' }),
}));


type StoreDetails = {
    storeName: string;
    gstin: string;
    address: string;
    phoneNumber: string;
};

type AdminState = {
    isAuthenticated: boolean;
    storeDetails: StoreDetails;
    login: () => void;
    logout: () => void;
    updateStoreDetails: (details: Partial<StoreDetails>) => void;
};

export const useAdminStore = create<AdminState>()(
    persist(
      (set) => ({
        isAuthenticated: false,
        storeDetails: {
          storeName: 'Zudio Store',
          gstin: '27ABCDE1234F1Z5',
          address: 'ABC Clothings Store',
          phoneNumber: '9876543210'
        },
        login: () => set({ isAuthenticated: true }),
        logout: () => set({ isAuthenticated: false }),
        updateStoreDetails: (details) =>
          set((state) => ({
            storeDetails: { ...state.storeDetails, ...details },
          })),
      }),
      {
        name: 'admin-storage', 
        storage: createJSONStorage(() => sessionStorage), 
      }
    )
  );