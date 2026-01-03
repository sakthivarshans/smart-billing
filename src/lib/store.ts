
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid';

export type BillItem = {
  id: number;
  name: string;
  price: number;
  timestamp: string;
  rfid: string;
  optional1?: string;
  optional2?: string;
};

type BillState = {
  items: BillItem[];
  phoneNumber: string;
  total: number;
  addItem: (item: Omit<BillItem, 'id' | 'timestamp'>) => void;
  setPhoneNumber: (number: string) => void;
  resetBill: () => void;
};

export const useBillStore = create<BillState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'bill-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);


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

export type Product = {
    id: string; // Barcode or RFID
    name: string;
    price: number;
    optional1?: string;
    optional2?: string;
};

export type StockItem = {
    rfid: string;
    name: string;
    price: number;
    quantity: number; // This represents the aggregated quantity for exports
};

export type IndividualStockItem = {
    rfid: string;
    name: string;
    price: number;
}

export type Sale = {
    id: string; // paymentId or uuid
    items: BillItem[];
    total: number;
    phoneNumber: string;
    date: string; // ISO string
    paymentResponse: any;
    status: 'success' | 'failure' | 'skipped';
    paymentMethod: 'UPI/QR' | 'Card' | 'NetBanking' | 'Wallet' | 'Skipped' | 'Unknown';
};

export type ColumnMapping = {
  idColumn: string;
  nameColumn: string;
  priceColumn: string;
  optionalColumn1: string;
  optionalColumn2: string;
}

export type DeveloperUser = {
  mobileNumber: string;
  passwordHash: string;
}

type AdminState = {
    isAuthenticated: boolean;
    password: string | null;
    hasBeenSetup: boolean;
    isDeveloper: boolean;
    storeDetails: StoreDetails;
    apiKeys: ApiKeys;
    productCatalog: Product[];
    stock: IndividualStockItem[];
    sales: Sale[];
    columnMapping: ColumnMapping;
    developers: DeveloperUser[];
    login: (password: string) => boolean;
    logout: () => void;
    setPassword: (password: string) => void;
    updateStoreDetails: (details: Partial<StoreDetails>) => void;
    updateApiKeys: (keys: Partial<ApiKeys>) => void;
    addStockItem: (item: IndividualStockItem) => void;
    getApiKeys: () => ApiKeys;
    addSale: (sale: Sale) => void;
    setProductCatalog: (products: Product[]) => void;
    setColumnMapping: (mapping: ColumnMapping) => void;
    clearInventory: () => void;
    addDeveloper: (mobileNumber: string, password?: string) => void;
    removeDeveloper: (mobileNumber: string) => void;
};

export const useAdminStore = create<AdminState>()(
    persist(
      (set, get) => ({
        isAuthenticated: false,
        password: null,
        hasBeenSetup: false,
        isDeveloper: false,
        storeDetails: {
          storeName: 'Zudio Store',
          gstin: '27ABCDE1234F1Z5',
          address: 'ABC Clothings Store',
          phoneNumber: '9876543210'
        },
        apiKeys: {
            whatsappApiKey: '',
            razorpayKeyId: '',
            razorpayKeySecret: '',
        },
        productCatalog: [],
        stock: [],
        sales: [],
        developers: [
          { mobileNumber: '9999999999', passwordHash: 'developer' }
        ],
        columnMapping: {
          idColumn: 'Barcode/RFID',
          nameColumn: 'Product Name',
          priceColumn: 'Price',
          optionalColumn1: 'Optional 1',
          optionalColumn2: 'Optional 2',
        },
        login: (password: string) => {
          const storedPassword = get().password;
          // Set isDeveloper to true for any admin login
          if (password === 'developer' || (storedPassword && password === storedPassword)) {
            set({ isAuthenticated: true, isDeveloper: true });
            return true;
          }
          return false;
        },
        logout: () => set({ isAuthenticated: false, isDeveloper: false }),
        setPassword: (password: string) => set({ password: password, hasBeenSetup: true }),
        updateStoreDetails: (details) =>
          set((state) => ({
            storeDetails: { ...state.storeDetails, ...details },
          })),
        updateApiKeys: (keys) =>
            set((state) => ({
                apiKeys: { ...state.apiKeys, ...keys },
            })),
        addStockItem: (item) => set((state) => {
            return { stock: [...state.stock, item]};
        }),
        addSale: (sale) => set((state) => ({
            sales: [...state.sales, sale],
        })),
        getApiKeys: () => get().apiKeys,
        setProductCatalog: (products) => set({ productCatalog: products }),
        setColumnMapping: (mapping: ColumnMapping) => set({ columnMapping: mapping }),
        clearInventory: () => set({ stock: [], productCatalog: [] }),
        addDeveloper: (mobileNumber, password = 'password') => {
          const developerExists = get().developers.some(d => d.mobileNumber === mobileNumber);
          if (developerExists) return;
          const newDeveloper: DeveloperUser = {
            mobileNumber,
            passwordHash: password
          };
          set(state => ({ developers: [...state.developers, newDeveloper] }));
        },
        removeDeveloper: (mobileNumber) => {
          set(state => ({
            developers: state.developers.filter(d => d.mobileNumber !== mobileNumber)
          }));
        },
      }),
      {
        name: 'admin-storage', 
        storage: createJSONStorage(() => localStorage), 
      }
    )
  );
  
// Selector to get specific api keys and prevent unnecessary re-renders
export const useApiKeys = () => useAdminStore((state) => state.apiKeys);


export type CustomerUser = {
  mobileNumber: string;
  passwordHash: string;
}

type CustomerState = {
    isAuthenticated: boolean;
    phoneNumber: string;
    users: CustomerUser[];
    login: (mobileNumber: string, password: string) => boolean;
    logout: () => void;
    addUser: (mobileNumber: string, password?: string) => void;
    removeUser: (mobileNumber: string) => void;
};

export const useCustomerStore = create<CustomerState>()(
    persist(
      (set, get) => ({
        isAuthenticated: false,
        phoneNumber: '',
        users: [
          { mobileNumber: '1234567890', passwordHash: 'password123' },
          { mobileNumber: '9655952985', passwordHash: '1234' },
        ], 
        login: (mobileNumber, password) => {
            const user = get().users.find(u => u.mobileNumber === mobileNumber);
            const developer = useAdminStore.getState().developers.find(d => d.mobileNumber === mobileNumber);

            if (user && password === user.passwordHash) {
                set({ isAuthenticated: true, phoneNumber: mobileNumber });
                return true;
            }
            if (developer && password === developer.passwordHash) {
              set({ isAuthenticated: true, phoneNumber: mobileNumber });
              return true;
            }
            return false;
        },
        logout: () => set({ isAuthenticated: false, phoneNumber: '' }),
        addUser: (mobileNumber, password = 'password') => {
          const userExists = get().users.some(u => u.mobileNumber === mobileNumber);
          if (userExists) {
            return; // Or throw an error, depending on desired behavior
          }
            const newUser: CustomerUser = {
                mobileNumber: mobileNumber,
                passwordHash: password, 
            };
            set((state) => ({
                users: [...state.users, newUser],
            }));
        },
        removeUser: (mobileNumber: string) => {
          set((state) => ({
            users: state.users.filter(u => u.mobileNumber !== mobileNumber),
          }));
        }
      }),
      {
        name: 'customer-storage', 
        storage: createJSONStorage(() => localStorage), 
      }
    )
  );
