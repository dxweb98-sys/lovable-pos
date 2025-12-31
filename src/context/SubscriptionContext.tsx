import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'advance';

export interface PlanFeatures {
  name: string;
  price: string;
  transactionLimit: number | null; // null = unlimited
  maxUsers: number;
  dailyReport: boolean;
  dailyBackup: boolean;
  openCloseDaily: boolean;
  reportExport: boolean;
  receiptExport: boolean;
  prioritySupport: boolean;
  multiOutlet: boolean;
  splitView: boolean;
  salesOrder: boolean;
  customFeatures: boolean;
}

export const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures> = {
  free: {
    name: 'Free',
    price: 'Rp 0',
    transactionLimit: 25,
    maxUsers: 1,
    dailyReport: false,
    dailyBackup: false,
    openCloseDaily: false,
    reportExport: false,
    receiptExport: false,
    prioritySupport: false,
    multiOutlet: false,
    splitView: false,
    salesOrder: false,
    customFeatures: false,
  },
  basic: {
    name: 'Basic',
    price: 'Rp 60K/mo',
    transactionLimit: null,
    maxUsers: 1,
    dailyReport: true,
    dailyBackup: true,
    openCloseDaily: true,
    reportExport: false,
    receiptExport: false,
    prioritySupport: false,
    multiOutlet: false,
    splitView: false,
    salesOrder: false,
    customFeatures: false,
  },
  pro: {
    name: 'Pro',
    price: 'Rp 120K/mo',
    transactionLimit: null,
    maxUsers: 3,
    dailyReport: true,
    dailyBackup: true,
    openCloseDaily: true,
    reportExport: true,
    receiptExport: true,
    prioritySupport: true,
    multiOutlet: false,
    splitView: false,
    salesOrder: false,
    customFeatures: false,
  },
  advance: {
    name: 'Advance',
    price: 'From Rp 160K/mo',
    transactionLimit: null,
    maxUsers: 999,
    dailyReport: true,
    dailyBackup: true,
    openCloseDaily: true,
    reportExport: true,
    receiptExport: true,
    prioritySupport: true,
    multiOutlet: true,
    splitView: true,
    salesOrder: true,
    customFeatures: true,
  },
};

interface SubscriptionContextType {
  currentPlan: SubscriptionPlan;
  features: PlanFeatures;
  monthlyTransactionCount: number;
  setPlan: (plan: SubscriptionPlan) => void;
  incrementTransactionCount: () => void;
  resetMonthlyCount: () => void;
  canMakeTransaction: () => boolean;
  hasFeature: (feature: keyof PlanFeatures) => boolean;
  getRemainingTransactions: () => number | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>('free');
  const [monthlyTransactionCount, setMonthlyTransactionCount] = useState(0);

  const features = PLAN_FEATURES[currentPlan];

  const setPlan = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan);
  };

  const incrementTransactionCount = () => {
    setMonthlyTransactionCount(prev => prev + 1);
  };

  const resetMonthlyCount = () => {
    setMonthlyTransactionCount(0);
  };

  const canMakeTransaction = (): boolean => {
    if (features.transactionLimit === null) return true;
    return monthlyTransactionCount < features.transactionLimit;
  };

  const hasFeature = (feature: keyof PlanFeatures): boolean => {
    const value = features[feature];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value > 0;
    return value !== null;
  };

  const getRemainingTransactions = (): number | null => {
    if (features.transactionLimit === null) return null;
    return Math.max(0, features.transactionLimit - monthlyTransactionCount);
  };

  return (
    <SubscriptionContext.Provider value={{
      currentPlan,
      features,
      monthlyTransactionCount,
      setPlan,
      incrementTransactionCount,
      resetMonthlyCount,
      canMakeTransaction,
      hasFeature,
      getRemainingTransactions,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
