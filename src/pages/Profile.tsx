import React, { useState, useMemo } from 'react';
import { 
  User, 
  Store, 
  LogOut, 
  Square, 
  ChevronRight, 
  Crown, 
  Lock,
  Building2,
  CreditCard,
  Receipt,
  DollarSign,
  Clock,
  MinusCircle,
  Plus,
  TrendingUp,
  ShoppingBag,
  Calendar,
  AlertCircle,
  Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, subDays, isAfter, startOfDay } from 'date-fns';
import { PageHeader } from '@/components/PageHeader';
import { GlassNavigation } from '@/components/GlassNavigation';
import { usePOS, Transaction } from '@/context/POSContext';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface Expense {
  id: string;
  description: string;
  amount: number;
}

interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeLogo: string;
}

interface PaymentSettings {
  cashEnabled: boolean;
  cardEnabled: boolean;
  qrisEnabled: boolean;
  qrisName: string;
  qrisMerchantId: string;
}

interface ReceiptSettings {
  showLogo: boolean;
  footerText: string;
  showAddress: boolean;
  showPhone: boolean;
}

const Profile: React.FC = () => {
  const [showCloseShift, setShowCloseShift] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showStoreSettings, setShowStoreSettings] = useState(false);
  const [showPaymentSettings, setShowPaymentSettings] = useState(false);
  const [showReceiptSettings, setShowReceiptSettings] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  
  const [closingCash, setClosingCash] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: 'QuickPOS Store',
    storeAddress: 'Jl. Sudirman No. 123, Jakarta',
    storePhone: '+62 812 3456 7890',
    storeLogo: '🏪',
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    cashEnabled: true,
    cardEnabled: true,
    qrisEnabled: true,
    qrisName: 'QuickPOS Store',
    qrisMerchantId: 'ID2023123456789',
  });

  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>({
    showLogo: true,
    footerText: 'Thank you for your purchase!',
    showAddress: true,
    showPhone: true,
  });
  
  const { currentShift, closeShift, transactions } = usePOS();
  const { user, profile, signOut } = useAuth();
  const { currentPlan } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalSales = currentShift?.transactions.reduce((sum, t) => sum + t.total, 0) || 0;
  const transactionCount = currentShift?.transactions.length || 0;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalSales - totalExpenses;

  // Calculate best-selling products
  const bestSellingProducts = useMemo(() => {
    if (!currentShift?.transactions.length) return [];
    
    const productCounts: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    currentShift.transactions.forEach(t => {
      t.items.forEach(item => {
        if (!productCounts[item.id]) {
          productCounts[item.id] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productCounts[item.id].quantity += item.quantity;
        productCounts[item.id].revenue += item.price * item.quantity;
      });
    });
    
    return Object.values(productCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3);
  }, [currentShift?.transactions]);

  // Filter transactions by date with 7-day limit for free users
  const filteredHistoryTransactions = useMemo(() => {
    const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
    const selectedDayStart = startOfDay(selectedDate);
    
    return transactions.filter(t => {
      const transactionDate = startOfDay(new Date(t.timestamp));
      return transactionDate.getTime() === selectedDayStart.getTime();
    });
  }, [transactions, selectedDate]);

  const isDateDisabledForFree = (date: Date) => {
    if (currentPlan !== 'free') return false;
    const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
    return !isAfter(date, sevenDaysAgo) && startOfDay(date).getTime() !== sevenDaysAgo.getTime();
  };

  const handleAddExpense = () => {
    if (!newExpenseDesc.trim() || !newExpenseAmount) return;
    
    const expense: Expense = {
      id: Date.now().toString(),
      description: newExpenseDesc.trim(),
      amount: parseFloat(newExpenseAmount) || 0,
    };
    
    setExpenses([...expenses, expense]);
    setNewExpenseDesc('');
    setNewExpenseAmount('');
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(closingCash) || 0;
    closeShift(amount);
    setShowCloseShift(false);
    setClosingCash('');
    setExpenses([]);
    toast({
      title: 'Shift closed!',
      description: `Total sales: $${totalSales.toFixed(2)} | Profit: $${profit.toFixed(2)}`,
    });
    navigate('/reports');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Password updated!',
        description: 'Your password has been changed successfully.',
      });
      setShowChangePassword(false);
      setNewPassword('');
      setConfirmPassword('');
    }

    setIsUpdating(false);
  };

  const handleSaveSettings = (type: string) => {
    toast({
      title: 'Settings saved!',
      description: `${type} settings have been updated.`,
    });
    if (type === 'Store') setShowStoreSettings(false);
    if (type === 'Payment') setShowPaymentSettings(false);
    if (type === 'Receipt') setShowReceiptSettings(false);
  };

  const menuItems = [
    {
      icon: Building2,
      label: 'Store Settings',
      description: 'Store profile, address, phone',
      action: () => setShowStoreSettings(true),
    },
    {
      icon: CreditCard,
      label: 'Payment Settings',
      description: 'Payment methods, QRIS',
      action: () => setShowPaymentSettings(true),
    },
    {
      icon: Receipt,
      label: 'Receipt Settings',
      description: 'Receipt customization',
      action: () => setShowReceiptSettings(true),
    },
    {
      icon: Calendar,
      label: 'Transaction History',
      description: currentPlan === 'free' ? 'Last 7 days (Free plan)' : 'View all transactions',
      action: () => setShowTransactionHistory(true),
    },
    {
      icon: Lock,
      label: 'Change Password',
      description: 'Update your password',
      action: () => setShowChangePassword(true),
    },
  ];

  return (
    <div className="page-container bg-background">
      <PageHeader title="Profile" showBack />

      <main className="px-4 space-y-4 pb-36">
        {/* Profile Card */}
        <div className="bg-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">
                {profile?.username || 'User'}
              </h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Crown className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary capitalize">{currentPlan} Plan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Shift Status */}
        {currentShift && currentShift.isOpen && (
          <div className="bg-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                <span className="font-semibold text-foreground">Shift Active</span>
              </div>
              <button
                onClick={() => setShowCloseShift(true)}
                className="h-9 px-4 bg-destructive/10 text-destructive text-sm font-medium rounded-xl flex items-center gap-2 active:scale-95 transition-transform"
              >
                <Square className="w-4 h-4" />
                Close Shift
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary rounded-2xl p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">Started</span>
                </div>
                <p className="font-semibold text-foreground">
                  {currentShift.openedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="bg-secondary rounded-2xl p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs">Sales</span>
                </div>
                <p className="font-semibold text-foreground">${totalSales.toFixed(2)}</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              {transactionCount} transactions completed
            </p>
          </div>
        )}

        {/* Upgrade Banner */}
        {currentPlan === 'free' && (
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Upgrade to Pro</p>
                <p className="text-xs text-muted-foreground">Unlock all features</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/subscription')}
              className="h-10 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-xl flex items-center gap-2"
            >
              Upgrade
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Menu Items */}
        <div className="bg-card rounded-3xl overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.action}
                className={`w-full p-4 flex items-center gap-4 hover:bg-secondary/50 active:bg-secondary transition-colors ${
                  index !== menuItems.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full h-14 bg-destructive/10 text-destructive font-semibold rounded-2xl hover:bg-destructive/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </main>

      {/* Close Shift Drawer with Expenses */}
      <Drawer open={showCloseShift} onOpenChange={setShowCloseShift}>
        <DrawerContent className="max-h-[90vh] rounded-t-3xl">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-xl font-bold text-center">Close Shift</DrawerTitle>
          </DrawerHeader>

          <form onSubmit={handleCloseShift} className="px-4 pb-8 space-y-4 overflow-y-auto max-h-[70vh]">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary/10 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-medium">Total Sales</span>
                </div>
                <p className="text-xl font-bold text-foreground">${totalSales.toFixed(2)}</p>
              </div>
              <div className="bg-success/10 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-success mb-1">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="text-xs font-medium">Transactions</span>
                </div>
                <p className="text-xl font-bold text-foreground">{transactionCount}</p>
              </div>
            </div>

            {/* Best Selling Products */}
            {bestSellingProducts.length > 0 && (
              <div className="bg-secondary/50 rounded-2xl p-4">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Best Selling Today
                </h4>
                <div className="space-y-2">
                  {bestSellingProducts.map((product, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                          {idx + 1}
                        </span>
                        <span className="text-foreground">{product.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-foreground">{product.quantity}x</span>
                        <span className="text-muted-foreground ml-2">${product.revenue.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expenses Section */}
            <div className="bg-secondary/50 rounded-2xl p-4">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <MinusCircle className="w-4 h-4 text-destructive" />
                Expenses Today
              </h4>
              
              {/* Add Expense */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newExpenseDesc}
                  onChange={(e) => setNewExpenseDesc(e.target.value)}
                  placeholder="Description"
                  className="flex-1 h-10 px-3 bg-background border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                />
                <input
                  type="number"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  placeholder="0"
                  className="w-20 h-10 px-3 bg-background border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddExpense}
                  className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Expense List */}
              {expenses.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {expenses.map(expense => (
                    <div key={expense.id} className="flex items-center justify-between bg-background rounded-xl p-3">
                      <span className="text-sm text-foreground">{expense.description}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-destructive">-${expense.amount.toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExpense(expense.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">No expenses recorded</p>
              )}
            </div>

            {/* Profit Summary */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Total Sales</span>
                <span className="font-medium text-foreground">${totalSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Total Expenses</span>
                <span className="font-medium text-destructive">-${totalExpenses.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between">
                <span className="font-semibold text-foreground">Net Profit</span>
                <span className={`font-bold text-lg ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ${profit.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Closing Cash */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Closing Cash Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="number"
                  value={closingCash}
                  onChange={(e) => setClosingCash(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full h-14 pl-12 pr-4 bg-secondary border-0 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-14 bg-destructive text-destructive-foreground font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Square className="w-5 h-5" />
              Close Shift
            </button>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Store Settings Drawer */}
      <Drawer open={showStoreSettings} onOpenChange={setShowStoreSettings}>
        <DrawerContent className="max-h-[85vh] rounded-t-3xl">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-xl font-bold text-center">Store Settings</DrawerTitle>
          </DrawerHeader>

          <div className="px-4 pb-8 space-y-4 overflow-y-auto max-h-[70vh]">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Store Logo (Emoji)</label>
              <input
                type="text"
                value={storeSettings.storeLogo}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeLogo: e.target.value })}
                className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground text-2xl text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
                maxLength={2}
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Store Name</label>
              <input
                type="text"
                value={storeSettings.storeName}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Your store name"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Address</label>
              <textarea
                value={storeSettings.storeAddress}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
                className="w-full h-20 px-4 py-3 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                placeholder="Store address"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Phone Number</label>
              <input
                type="tel"
                value={storeSettings.storePhone}
                onChange={(e) => setStoreSettings({ ...storeSettings, storePhone: e.target.value })}
                className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="+62 xxx xxxx xxxx"
              />
            </div>

            <button
              onClick={() => handleSaveSettings('Store')}
              className="w-full h-14 bg-foreground text-background font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Settings
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Payment Settings Drawer */}
      <Drawer open={showPaymentSettings} onOpenChange={setShowPaymentSettings}>
        <DrawerContent className="max-h-[85vh] rounded-t-3xl">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-xl font-bold text-center">Payment Settings</DrawerTitle>
          </DrawerHeader>

          <div className="px-4 pb-8 space-y-4 overflow-y-auto max-h-[70vh]">
            <div className="space-y-3">
              {/* Cash */}
              <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💵</span>
                  <span className="font-medium text-foreground">Cash</span>
                </div>
                <button
                  onClick={() => setPaymentSettings({ ...paymentSettings, cashEnabled: !paymentSettings.cashEnabled })}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    paymentSettings.cashEnabled ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div className={`w-5 h-5 bg-background rounded-full transition-transform ${
                    paymentSettings.cashEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Card */}
              <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💳</span>
                  <span className="font-medium text-foreground">Card</span>
                </div>
                <button
                  onClick={() => setPaymentSettings({ ...paymentSettings, cardEnabled: !paymentSettings.cardEnabled })}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    paymentSettings.cardEnabled ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div className={`w-5 h-5 bg-background rounded-full transition-transform ${
                    paymentSettings.cardEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* QRIS */}
              <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <span className="font-medium text-foreground">QRIS</span>
                </div>
                <button
                  onClick={() => setPaymentSettings({ ...paymentSettings, qrisEnabled: !paymentSettings.qrisEnabled })}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    paymentSettings.qrisEnabled ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div className={`w-5 h-5 bg-background rounded-full transition-transform ${
                    paymentSettings.qrisEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            {paymentSettings.qrisEnabled && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Merchant Name</label>
                  <input
                    type="text"
                    value={paymentSettings.qrisName}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, qrisName: e.target.value })}
                    className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Merchant name"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Merchant ID</label>
                  <input
                    type="text"
                    value={paymentSettings.qrisMerchantId}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, qrisMerchantId: e.target.value })}
                    className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Merchant ID"
                  />
                </div>
              </div>
            )}

            <button
              onClick={() => handleSaveSettings('Payment')}
              className="w-full h-14 bg-foreground text-background font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Settings
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Receipt Settings Drawer */}
      <Drawer open={showReceiptSettings} onOpenChange={setShowReceiptSettings}>
        <DrawerContent className="max-h-[85vh] rounded-t-3xl">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-xl font-bold text-center">Receipt Settings</DrawerTitle>
          </DrawerHeader>

          <div className="px-4 pb-8 space-y-4 overflow-y-auto max-h-[70vh]">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                <span className="font-medium text-foreground">Show Store Logo</span>
                <button
                  onClick={() => setReceiptSettings({ ...receiptSettings, showLogo: !receiptSettings.showLogo })}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    receiptSettings.showLogo ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div className={`w-5 h-5 bg-background rounded-full transition-transform ${
                    receiptSettings.showLogo ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                <span className="font-medium text-foreground">Show Address</span>
                <button
                  onClick={() => setReceiptSettings({ ...receiptSettings, showAddress: !receiptSettings.showAddress })}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    receiptSettings.showAddress ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div className={`w-5 h-5 bg-background rounded-full transition-transform ${
                    receiptSettings.showAddress ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                <span className="font-medium text-foreground">Show Phone Number</span>
                <button
                  onClick={() => setReceiptSettings({ ...receiptSettings, showPhone: !receiptSettings.showPhone })}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    receiptSettings.showPhone ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div className={`w-5 h-5 bg-background rounded-full transition-transform ${
                    receiptSettings.showPhone ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Footer Text</label>
              <textarea
                value={receiptSettings.footerText}
                onChange={(e) => setReceiptSettings({ ...receiptSettings, footerText: e.target.value })}
                className="w-full h-20 px-4 py-3 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                placeholder="Thank you message..."
              />
            </div>

            <button
              onClick={() => handleSaveSettings('Receipt')}
              className="w-full h-14 bg-foreground text-background font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Settings
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Transaction History Drawer */}
      <Drawer open={showTransactionHistory} onOpenChange={setShowTransactionHistory}>
        <DrawerContent className="max-h-[90vh] rounded-t-3xl">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-xl font-bold text-center">Transaction History</DrawerTitle>
          </DrawerHeader>

          <div className="px-4 pb-8 space-y-4 overflow-y-auto max-h-[75vh]">
            {/* Free Plan Notice */}
            {currentPlan === 'free' && (
              <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Free Plan Limitation</p>
                  <p className="text-xs text-muted-foreground">You can only view transactions from the last 7 days.</p>
                  <button
                    onClick={() => {
                      setShowTransactionHistory(false);
                      navigate('/subscription');
                    }}
                    className="mt-2 text-xs text-primary font-medium flex items-center gap-1"
                  >
                    <Crown className="w-3 h-3" />
                    Upgrade to see more
                  </button>
                </div>
              </div>
            )}

            {/* Date Picker */}
            <div className="flex justify-center">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date > new Date() || isDateDisabledForFree(date)}
                className="rounded-xl border border-border pointer-events-auto"
              />
            </div>

            {/* Selected Date */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Showing transactions for</p>
              <p className="font-semibold text-foreground">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
            </div>

            {/* Transactions List */}
            <div className="bg-card rounded-2xl p-4">
              {filteredHistoryTransactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No transactions on this date</p>
              ) : (
                <div className="space-y-3">
                  {filteredHistoryTransactions.map(transaction => (
                    <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium text-foreground">
                          {transaction.items.length} {transaction.items.length === 1 ? 'item' : 'items'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' • '}
                          <span className="capitalize">{transaction.paymentMethod}</span>
                        </p>
                      </div>
                      <span className="font-semibold text-primary">${transaction.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Change Password Drawer */}
      <Drawer open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DrawerContent className="max-h-[85vh] rounded-t-3xl">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-xl font-bold text-center">Change Password</DrawerTitle>
          </DrawerHeader>

          <form onSubmit={handleChangePassword} className="px-4 pb-8 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full h-14 pl-12 pr-4 bg-secondary border-0 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full h-14 pl-12 pr-4 bg-secondary border-0 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full h-14 bg-foreground text-background font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUpdating ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </DrawerContent>
      </Drawer>

      <GlassNavigation />
    </div>
  );
};

export default Profile;