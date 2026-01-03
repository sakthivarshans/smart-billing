

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
  status: 'sold' | 'returned';
};

type BillState = {
  items: BillItem[];
  phoneNumber: string;
  total: number;
  addItem: (item: Omit<BillItem, 'id' | 'timestamp' | 'status'>) => void;
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
            status: 'sold',
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
    emailApiKey: string;
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
  emailId: string;
}

export type Role = 'owner' | 'manager' | 'developer';

type AdminState = {
    isAuthenticated: boolean;
    loggedInRole: Role | null;
    managerPermissions: string[];
    storeDetails: StoreDetails;
    apiKeys: ApiKeys;
    productCatalog: Product[];
    stock: IndividualStockItem[];
    sales: Sale[];
    columnMapping: ColumnMapping;
    developers: DeveloperUser[];
    login: (role: Role) => boolean;
    logout: () => void;
    updateStoreDetails: (details: Partial<StoreDetails>) => void;
    updateApiKeys: (keys: Partial<ApiKeys>) => void;
    addStockItem: (item: IndividualStockItem) => void;
    getApiKeys: () => ApiKeys;
    addSale: (sale: Sale) => void;
    processReturn: (saleId: string, itemId: number) => void;
    setProductCatalog: (products: Product[]) => void;
    setColumnMapping: (mapping: ColumnMapping) => void;
    clearInventory: () => void;
    addDeveloper: (mobileNumber: string, emailId: string) => void;
    removeDeveloper: (mobileNumber: string) => void;
    setManagerPermissions: (permissions: string[]) => void;
};


export const useAdminStore = create<AdminState>()(
    persist(
      (set, get) => ({
        isAuthenticated: false,
        loggedInRole: null,
        managerPermissions: ['dashboard', 'sales', 'stock-inward', 'inventory', 'returns'],
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
            emailApiKey: '',
        },
        productCatalog: [],
        stock: [],
        sales: [],
        developers: [
            { mobileNumber: '9999999999', emailId: 'dev@example.com' },
        ],
        columnMapping: {
          idColumn: 'Barcode/RFID',
          nameColumn: 'Product Name',
          priceColumn: 'Price',
          optionalColumn1: 'Optional 1',
          optionalColumn2: 'Optional 2',
        },
        login: (role) => {
            set({ isAuthenticated: true, loggedInRole: role });
            return true;
        },
        logout: () => set({ isAuthenticated: false, loggedInRole: null }),
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
        processReturn: (saleId, itemId) => {
          set(state => {
            const updatedSales = state.sales.map(sale => {
              if (sale.id === saleId) {
                const updatedItems = sale.items.map(item => {
                  if (item.id === itemId) {
                    return { ...item, status: 'returned' as const };
                  }
                  return item;
                });
                return { ...sale, items: updatedItems };
              }
              return sale;
            });
            return { sales: updatedSales };
          });
        },
        getApiKeys: () => get().apiKeys,
        setProductCatalog: (products) => set({ productCatalog: products }),
        setColumnMapping: (mapping: ColumnMapping) => set({ columnMapping: mapping }),
        clearInventory: () => set({ stock: [], productCatalog: [] }),
        addDeveloper: (mobileNumber, emailId) => {
          const developerExists = get().developers.some(d => d.mobileNumber === mobileNumber);
          if (developerExists) {
            set(state => ({
              developers: state.developers.map(dev => 
                dev.mobileNumber === mobileNumber 
                ? { mobileNumber, emailId }
                : dev
              )
            }));
          } else {
            const newDeveloper: DeveloperUser = {
              mobileNumber,
              emailId,
            };
            set(state => ({ developers: [...state.developers, newDeveloper] }));
          }
        },
        removeDeveloper: (mobileNumber) => {
          set(state => ({
            developers: state.developers.filter(d => d.mobileNumber !== mobileNumber)
          }));
        },
        setManagerPermissions: (permissions) => set({ managerPermissions: permissions }),
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
  shopName: string;
  emailId: string;
  operatorMobileNumber: string;
}

type CustomerState = {
    isAuthenticated: boolean;
    phoneNumber: string;
    users: CustomerUser[];
    login: (mobileNumber: string) => boolean;
    logout: () => void;
    addUser: (shopName: string, emailId: string, operatorMobile: string) => void;
    removeUser: (operatorMobile: string) => void;
};

export const useCustomerStore = create<CustomerState>()(
    persist(
      (set, get) => ({
        isAuthenticated: false,
        phoneNumber: '',
        users: [
          { shopName: 'Default Shop', emailId: 'default@example.com', operatorMobileNumber: '9999999999' },
        ], 
        login: (mobileNumber) => {
          const user = get().users.find(u => u.operatorMobileNumber === mobileNumber);
          if (user) {
              set({ isAuthenticated: true, phoneNumber: mobileNumber });
              return true;
          }
          return false;
        },
        logout: () => {
          set({ isAuthenticated: false, phoneNumber: ''});
        },
        addUser: (shopName, emailId, operatorMobile) => {
          set((state) => {
            const userExists = state.users.some(u => u.operatorMobileNumber === operatorMobile);
            const newUser: CustomerUser = { 
              shopName, 
              emailId, 
              operatorMobileNumber: operatorMobile,
            };
            if (userExists) {
              return {
                users: state.users.map(u => u.operatorMobileNumber === operatorMobile ? newUser : u)
              };
            }
            return {
              users: [...state.users, newUser],
            };
          });
        },
        removeUser: (operatorMobile: string) => {
          set((state) => ({
            users: state.users.filter(u => u.operatorMobileNumber !== operatorMobile),
          }));
        },
      }),
      {
        name: 'customer-storage',
        storage: createJSONStorage(() => localStorage),
      }
    )
  );

// Add the users array to the admin store state so it can be accessed there
useAdminStore.setState({ users: useCustomerStore.getState().users });
useCustomerStore.subscribe(
    users => useAdminStore.setState({ users }),
    state => state.users
);
