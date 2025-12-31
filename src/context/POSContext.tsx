import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  customer?: Customer;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  timestamp: Date;
}

export interface Shift {
  id: string;
  openedAt: Date;
  closedAt?: Date;
  openingCash: number;
  closingCash?: number;
  transactions: Transaction[];
  isOpen: boolean;
}

interface POSContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  
  customer: Customer | null;
  setCustomer: (customer: Customer | null) => void;
  
  currentShift: Shift | null;
  openShift: (openingCash: number) => void;
  closeShift: (closingCash: number) => void;
  
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  
  isLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  currentUser: string | null;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev => prev.map(i => 
      i.id === id ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => {
    setCart([]);
    setCustomer(null);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const openShift = (openingCash: number) => {
    const newShift: Shift = {
      id: Date.now().toString(),
      openedAt: new Date(),
      openingCash,
      transactions: [],
      isOpen: true,
    };
    setCurrentShift(newShift);
  };

  const closeShift = (closingCash: number) => {
    if (currentShift) {
      setCurrentShift({
        ...currentShift,
        closedAt: new Date(),
        closingCash,
        isOpen: false,
      });
    }
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setTransactions(prev => [...prev, newTransaction]);
    if (currentShift) {
      setCurrentShift({
        ...currentShift,
        transactions: [...currentShift.transactions, newTransaction],
      });
    }
    clearCart();
  };

  const login = (username: string, password: string): boolean => {
    // Simple mock authentication
    if (username && password.length >= 4) {
      setIsLoggedIn(true);
      setCurrentUser(username);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentShift(null);
    clearCart();
  };

  return (
    <POSContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      customer,
      setCustomer,
      currentShift,
      openShift,
      closeShift,
      transactions,
      addTransaction,
      isLoggedIn,
      login,
      logout,
      currentUser,
    }}>
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
