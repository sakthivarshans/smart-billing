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


export type StoreDetails = {
    storeName: string;
    gstin: string;
    address: string;
    phoneNumber: string;
};

type AdminState = {
    isAuthenticated: boolean;
    password: string | null;
    hasBeenSetup: boolean;
    storeDetails: StoreDetails;
    login: (password: string) => boolean;
    logout: () => void;
    setPassword: (password: string) => void;
    updateStoreDetails: (details: Partial<StoreDetails>) => void;
};

export const useAdminStore = create<AdminState>()(
    persist(
      (set, get) => ({
        isAuthenticated: false,
        password: null,
        hasBeenSetup: false,
        storeDetails: {
          storeName: 'Zudio Store',
          gstin: '27ABCDE1234F1Z5',
          address: 'ABC Clothings Store',
          phoneNumber: '9876543210'
        },
        login: (password: string) => {
            const storedPassword = get().password;
            if (storedPassword && password === storedPassword) {
                set({ isAuthenticated: true });
                return true;
            }
            return false;
        },
        logout: () => set({ isAuthenticated: false }),
        setPassword: (password: string) => set({ password: password, hasBeenSetup: true }),
        updateStoreDetails: (details) =>
          set((state) => ({
            storeDetails: { ...state.storeDetails, ...details },
          })),
      }),
      {
        name: 'admin-storage', 
        storage: createJSONStorage(() => localStorage), 
      }
    )
  );
