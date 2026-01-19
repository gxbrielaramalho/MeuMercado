import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Product, Sale, CartItem, Category, PaymentMethod, User, UserRole, ItemStatus } from '../types';

interface MarketContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  products: Product[];
  sales: Sale[];
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  toggleItemStatus: (productId: string) => void;
  clearCart: () => void;
  completeSale: (paymentMethod: PaymentMethod) => Sale | null;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

// Mock Users
const MOCK_USERS: Record<UserRole, User> = {
  [UserRole.DEVELOPER]: { id: 'dev1', name: 'Dev System', role: UserRole.DEVELOPER, avatar: 'https://picsum.photos/id/1/100/100' },
  [UserRole.OWNER]: { id: 'own1', name: 'Sr. Roberto', role: UserRole.OWNER, avatar: 'https://picsum.photos/id/2/100/100' },
  [UserRole.MANAGER]: { id: 'mgr1', name: 'Ana Gerente', role: UserRole.MANAGER, avatar: 'https://picsum.photos/id/3/100/100' },
  [UserRole.CASHIER]: { id: 'csh1', name: 'João Caixa', role: UserRole.CASHIER, avatar: 'https://picsum.photos/id/4/100/100' },
};

// Mock Data with Barcodes (EAN-13 style)
const INITIAL_PRODUCTS: Product[] = [
  { id: '7894900011517', name: 'Coca-Cola 2L', price: 9.50, cost: 6.00, stock: 45, category: Category.BEVERAGES, imageUrl: 'https://picsum.photos/id/10/200/200' },
  { id: '7891000053508', name: 'Arroz 5kg', price: 24.90, cost: 18.00, stock: 20, category: Category.FOOD, imageUrl: 'https://picsum.photos/id/11/200/200' },
  { id: '7891035800236', name: 'Sabão em Pó', price: 15.90, cost: 10.50, stock: 12, category: Category.CLEANING, imageUrl: 'https://picsum.photos/id/12/200/200' },
  { id: '7896051111514', name: 'Leite Integral', price: 5.20, cost: 3.50, stock: 5, category: Category.BEVERAGES, imageUrl: 'https://picsum.photos/id/13/200/200' },
  { id: '1001', name: 'Banana Prata (kg)', price: 6.99, cost: 3.00, stock: 15, category: Category.PRODUCE, imageUrl: 'https://picsum.photos/id/14/200/200' }, // Short code for scale items
  { id: '7891150044802', name: 'Shampoo Seda', price: 12.50, cost: 7.00, stock: 8, category: Category.HYGIENE, imageUrl: 'https://picsum.photos/id/15/200/200' },
];

const INITIAL_SALES: Sale[] = [
  { 
    id: 's1', 
    timestamp: Date.now() - 86400000, 
    items: [{...INITIAL_PRODUCTS[0], quantity: 2, status: ItemStatus.PAID}], 
    total: 19.00, 
    paymentMethod: PaymentMethod.CASH,
    cashierName: 'João Caixa'
  },
  { 
    id: 's2', 
    timestamp: Date.now() - 43200000, 
    items: [{...INITIAL_PRODUCTS[1], quantity: 1, status: ItemStatus.PAID}, {...INITIAL_PRODUCTS[3], quantity: 2, status: ItemStatus.PAID}], 
    total: 35.30, 
    paymentMethod: PaymentMethod.PIX,
    cashierName: 'João Caixa'
  }
];

export const MarketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [cart, setCart] = useState<CartItem[]>([]);

  const login = (role: UserRole) => {
    setUser(MOCK_USERS[role]);
  };

  const logout = () => {
    setUser(null);
    setCart([]);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        // If it was cancelled, reset to pending and quantity 1, otherwise increment
        if (existing.status === ItemStatus.CANCELLED) {
            return prev.map(item => item.id === product.id ? { ...item, quantity: 1, status: ItemStatus.PENDING } : item);
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, status: ItemStatus.PENDING }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
  };

  const toggleItemStatus = (productId: string) => {
    setCart(prev => prev.map(item => {
        if (item.id === productId) {
            const newStatus = item.status === ItemStatus.CANCELLED ? ItemStatus.PENDING : ItemStatus.CANCELLED;
            return { ...item, status: newStatus };
        }
        return item;
    }));
  };

  const clearCart = () => setCart([]);

  const completeSale = (paymentMethod: PaymentMethod): Sale | null => {
    // Filter only valid (non-cancelled) items
    const validItems = cart.filter(item => item.status !== ItemStatus.CANCELLED);
    
    if (validItems.length === 0) return null;

    const total = validItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    // Mark items as PAID for the record
    const finalItems = validItems.map(item => ({...item, status: ItemStatus.PAID}));

    const newSale: Sale = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      items: finalItems,
      total,
      paymentMethod,
      cashierName: user?.name || 'Sistema'
    };

    // Deduct stock
    setProducts(prev => prev.map(p => {
      const cartItem = validItems.find(c => c.id === p.id);
      if (cartItem) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
      }
      return p;
    }));

    setSales(prev => [newSale, ...prev]);
    clearCart();
    return newSale;
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  return (
    <MarketContext.Provider value={{
      user, login, logout,
      products, sales, cart,
      addToCart, removeFromCart, updateCartQuantity, toggleItemStatus, clearCart, completeSale,
      addProduct, updateProduct, deleteProduct
    }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};