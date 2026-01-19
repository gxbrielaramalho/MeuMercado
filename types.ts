export enum PaymentMethod {
  CASH = 'Dinheiro',
  CREDIT_CARD = 'Cartão de Crédito',
  DEBIT_CARD = 'Cartão de Débito',
  PIX = 'PIX'
}

export enum ItemStatus {
  PENDING = 'Pendente',
  PAID = 'Pago',
  CANCELLED = 'Cancelado'
}

export enum Category {
  BEVERAGES = 'Bebidas',
  FOOD = 'Alimentos',
  CLEANING = 'Limpeza',
  HYGIENE = 'Higiene',
  PRODUCE = 'Hortifruti',
  OTHER = 'Outros'
}

export enum UserRole {
  DEVELOPER = 'Desenvolvedor',
  OWNER = 'Dono',
  MANAGER = 'Gerente',
  CASHIER = 'Caixa'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Product {
  id: string; // Will be the Barcode (EAN)
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: Category;
  description?: string;
  imageUrl?: string;
}

export interface CartItem extends Product {
  quantity: number;
  status: ItemStatus;
}

export interface Sale {
  id: string;
  timestamp: number;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
  cashierName?: string;
}

export interface SalesSummary {
  totalRevenue: number;
  totalSales: number;
  topSellingProduct: string;
}