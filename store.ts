
import { User, Product, Customer, Sale, Purchase, AppSettings } from './types';

const STORAGE_KEY = 'khmteam_storage_v1';

export interface StoreData {
  users: User[];
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  purchases: Purchase[];
  settings: AppSettings;
}

const defaultSettings: AppSettings = {
  companyName: 'KHMTEAM Business',
  logo: 'https://picsum.photos/200/200?random=1',
  vatNumber: '310983546700003',
  address: 'Warehouse: Al-Fayhaa Dist. Jeddah, KSA',
  phone: '0560659793',
  currency: 'SR'
};

const initialData: StoreData = {
  users: [
    { 
      id: '1', 
      email: 'roki255190@gmail.com', 
      name: 'Admin Roki', 
      role: 'ADMIN', 
      status: 'APPROVED', 
      permissions: ['all'] 
    }
  ],
  products: [],
  customers: [],
  sales: [],
  purchases: [],
  settings: defaultSettings
};

export const getStore = (): StoreData => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Store parsing failed", e);
      return initialData;
    }
  }
  return initialData;
};

export const saveStore = (data: StoreData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Auto-initialize if empty
if (!localStorage.getItem(STORAGE_KEY)) {
  saveStore(initialData);
}
