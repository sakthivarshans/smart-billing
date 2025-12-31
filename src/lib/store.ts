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

export type ApiKeys = {
    whatsappApiKey: string;
    razorpayKeyId: string;
    razorpayKeySecret: string;
};

type AdminState = {
    isAuthenticated: boolean;
    password: string | null;
    hasBeenSetup: boolean;
    storeDetails: StoreDetails;
    apiKeys: ApiKeys;
    login: (password: string) => boolean;
    logout: () => void;
    setPassword: (password: string) => void;
    updateStoreDetails: (details: Partial<StoreDetails>) => void;
    updateApiKeys: (keys: Partial<ApiKeys>) => void;
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
        apiKeys: {
            whatsappApiKey: '',
            razorpayKeyId: 'rzp_test_RyETUyYsV3wYnQ', // Default test key
            razorpayKeySecret: '',
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
        updateApiKeys: (keys) =>
            set((state) => ({
                apiKeys: { ...state.apiKeys, ...keys },
            })),
      }),
      {
        name: 'admin-storage', 
        storage: createJSONStorage(() => localStorage), 
      }
    )
  );

type CustomerUser = {
  mobileNumber: string;
  passwordHash: string;
}

type CustomerState = {
    isAuthenticated: boolean;
    phoneNumber: string;
    users: CustomerUser[];
    login: (mobileNumber: string, password: string) => boolean;
    logout: () => void;
    signup: (mobileNumber: string, password: string) => void;
};

export const useCustomerStore = create<CustomerState>()(
    persist(
      (set, get) => ({
        isAuthenticated: false,
        phoneNumber: '',
        users: [{ mobileNumber: '1234567890', passwordHash: 'password123' }], // Mock user for testing
        login: (mobileNumber, password) => {
            const user = get().users.find(u => u.mobileNumber === mobileNumber);
            // In a real app, you would compare a hashed password.
            // For this mock, we are doing a plain text comparison.
            if (user && password === user.passwordHash) {
                set({ isAuthenticated: true, phoneNumber: mobileNumber });
                return true;
            }
            return false;
        },
        logout: () => set({ isAuthenticated: false, phoneNumber: '' }),
        signup: (mobileNumber, password) => {
            const newUser: CustomerUser = {
                mobileNumber: mobileNumber,
                passwordHash: password, // In a real app, hash this password!
            };
            set((state) => ({
                users: [...state.users, newUser],
            }));
        },
      }),
      {
        name: 'customer-storage', 
        storage: createJSONStorage(() => localStorage), 
      }
    )
  );
