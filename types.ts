
export type UserRole = 'ADMIN' | 'SALESMAN';
export type UserStatus = 'PENDING' | 'APPROVED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  permissions: string[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  category: string;
  salesmanId?: string; // ID of the salesman this product is assigned to
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  vat: number;
  total: number;
  salesmanId: string;
}

export interface Purchase {
  id: string;
  date: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  salesmanId?: string;
}

export interface AppSettings {
  companyName: string;
  logo: string;
  vatNumber: string;
  address: string;
  phone: string;
  currency: string;
}
