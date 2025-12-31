import React, { useState, useMemo } from 'react';
import { 
  User, 
  LogOut, 
  ChevronRight, 
  Crown, 
  Lock,
  Building2,
  CreditCard,
  Receipt,
  DollarSign,
  MinusCircle,
  Plus,
  Calendar,
  AlertCircle,
  Save,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, subDays, isAfter, startOfDay } from 'date-fns';
import { PageHeader } from '@/components/PageHeader';
import { GlassNavigation } from '@/components/GlassNavigation';
import { usePOS, Expense } from '@/context/POSContext';
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
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showStoreSettings, setShowStoreSettings] = useState(false);
  const [showPaymentSettings, setShowPaymentSettings] = useState(false);
  const [showReceiptSettings, setShowReceiptSettings] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [showExpenses, setShowExpenses] = useState(false);
  
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
  
  const { transactions, expenses, addExpense, removeExpense } = usePOS();
  const { user, profile, signOut } = useAuth();
  const { currentPlan } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Calculate today's expenses total
  const todayExpenses = useMemo(() => {
    const today = startOfDay(new Date());
    return expenses.filter(e => startOfDay(new Date(e.date)).getTime() === today.getTime());
  }, [expenses]);

  const todayExpensesTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Filter transactions by date with 7-day limit for free users
  const filteredHistoryTransactions = useMemo(() => {
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
    
    addExpense({
      description: newExpenseDesc.trim(),
      amount: parseFloat(newExpenseAmount) || 0,
    });
    
    setNewExpenseDesc('');
    setNewExpenseAmount('');
    
    toast({
      title: 'Expense added',
      description: `$${parseFloat(newExpenseAmount).toFixed(2)} for ${newExpenseDesc.trim()}`,
    });
  };

  const handleRemoveExpense = (id: string) => {
    removeExpense(id);
    toast({
      title: 'Expense removed',
    });
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
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
      icon: MinusCircle,
      label: 'Expenses',
      description: `Today: $${todayExpensesTotal.toFixed(2)}`,
      action: () => setShowExpenses(true),
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

      {/* Expenses Drawer */}
      <Drawer open={showExpenses} onOpenChange={setShowExpenses}>
        <DrawerContent className="max-h-[90vh] rounded-t-3xl">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-xl font-bold text-center">Expenses</DrawerTitle>
          </DrawerHeader>

          <div className="px-4 pb-8 space-y-4 overflow-y-auto max-h-[70vh]">
            {/* Today's Total */}
            <div className="bg-destructive/10 rounded-2xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Today's Expenses</p>
              <p className="text-3xl font-bold text-destructive">${todayExpensesTotal.toFixed(2)}</p>
            </div>

            {/* Add Expense */}
            <div className="bg-secondary/50 rounded-2xl p-4">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                Add Expense
              </h4>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newExpenseDesc}
                  onChange={(e) => setNewExpenseDesc(e.target.value)}
                  placeholder="Description (e.g., Supplies)"
                  className="flex-1 h-12 px-4 bg-background border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="number"
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-24 h-12 pl-8 pr-3 bg-background border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <button
                  onClick={handleAddExpense}
                  disabled={!newExpenseDesc.trim() || !newExpenseAmount}
                  className="h-12 px-4 bg-primary text-primary-foreground rounded-xl flex items-center justify-center disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Expense List */}
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Today's Expenses</h4>
              {todayExpenses.length > 0 ? (
                todayExpenses.map(expense => (
                  <div key={expense.id} className="bg-card rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(expense.date), 'h:mm a')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-destructive">-${expense.amount.toFixed(2)}</span>
                      <button
                        onClick={() => handleRemoveExpense(expense.id)}
                        className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-card rounded-xl p-8 text-center">
                  <MinusCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No expenses recorded today</p>
                </div>
              )}
            </div>

            {/* All Expenses */}
            {expenses.length > todayExpenses.length && (
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Previous Expenses</h4>
                {expenses
                  .filter(e => startOfDay(new Date(e.date)).getTime() !== startOfDay(new Date()).getTime())
                  .slice(0, 10)
                  .map(expense => (
                    <div key={expense.id} className="bg-secondary/30 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground text-sm">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(expense.date), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <span className="font-semibold text-destructive text-sm">-${expense.amount.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
            )}
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
              <label className="text-sm text-muted-foreground mb-1.5 block">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full h-14 bg-primary text-primary-foreground font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isUpdating ? 'Updating...' : 'Update Password'}
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

          <div className="px-4 pb-8 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Store Name</label>
              <input
                type="text"
                value={storeSettings.storeName}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Address</label>
              <input
                type="text"
                value={storeSettings.storeAddress}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
                className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Phone</label>
              <input
                type="tel"
                value={storeSettings.storePhone}
                onChange={(e) => setStoreSettings({ ...storeSettings, storePhone: e.target.value })}
                className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              onClick={() => handleSaveSettings('Store')}
              className="w-full h-14 bg-primary text-primary-foreground font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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

          <div className="px-4 pb-8 space-y-4">
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                <span className="font-medium text-foreground">Cash Payments</span>
                <input
                  type="checkbox"
                  checked={paymentSettings.cashEnabled}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, cashEnabled: e.target.checked })}
                  className="w-5 h-5 rounded accent-primary"
                />
              </label>
              <label className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                <span className="font-medium text-foreground">Card Payments</span>
                <input
                  type="checkbox"
                  checked={paymentSettings.cardEnabled}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, cardEnabled: e.target.checked })}
                  className="w-5 h-5 rounded accent-primary"
                />
              </label>
              <label className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                <span className="font-medium text-foreground">QRIS Payments</span>
                <input
                  type="checkbox"
                  checked={paymentSettings.qrisEnabled}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, qrisEnabled: e.target.checked })}
                  className="w-5 h-5 rounded accent-primary"
                />
              </label>
            </div>

            {paymentSettings.qrisEnabled && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">QRIS Name</label>
                  <input
                    type="text"
                    value={paymentSettings.qrisName}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, qrisName: e.target.value })}
                    className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Merchant ID</label>
                  <input
                    type="text"
                    value={paymentSettings.qrisMerchantId}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, qrisMerchantId: e.target.value })}
                    className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            )}

            <button
              onClick={() => handleSaveSettings('Payment')}
              className="w-full h-14 bg-primary text-primary-foreground font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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

          <div className="px-4 pb-8 space-y-4">
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                <span className="font-medium text-foreground">Show Logo</span>
                <input
                  type="checkbox"
                  checked={receiptSettings.showLogo}
                  onChange={(e) => setReceiptSettings({ ...receiptSettings, showLogo: e.target.checked })}
                  className="w-5 h-5 rounded accent-primary"
                />
              </label>
              <label className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                <span className="font-medium text-foreground">Show Address</span>
                <input
                  type="checkbox"
                  checked={receiptSettings.showAddress}
                  onChange={(e) => setReceiptSettings({ ...receiptSettings, showAddress: e.target.checked })}
                  className="w-5 h-5 rounded accent-primary"
                />
              </label>
              <label className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                <span className="font-medium text-foreground">Show Phone</span>
                <input
                  type="checkbox"
                  checked={receiptSettings.showPhone}
                  onChange={(e) => setReceiptSettings({ ...receiptSettings, showPhone: e.target.checked })}
                  className="w-5 h-5 rounded accent-primary"
                />
              </label>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Footer Text</label>
              <input
                type="text"
                value={receiptSettings.footerText}
                onChange={(e) => setReceiptSettings({ ...receiptSettings, footerText: e.target.value })}
                className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              onClick={() => handleSaveSettings('Receipt')}
              className="w-full h-14 bg-primary text-primary-foreground font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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

          <div className="px-4 pb-8 space-y-4 overflow-y-auto max-h-[70vh]">
            {/* Free Plan Notice */}
            {currentPlan === 'free' && (
              <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">Free Plan Limitation</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You can only view transactions from the last 7 days. Upgrade to see full history.
                  </p>
                  <button
                    onClick={() => {
                      setShowTransactionHistory(false);
                      navigate('/subscription');
                    }}
                    className="mt-2 text-xs text-primary font-medium flex items-center gap-1"
                  >
                    <Crown className="w-3 h-3" />
                    Upgrade Now
                  </button>
                </div>
              </div>
            )}

            {/* Date Picker */}
            <div className="bg-card rounded-2xl p-4">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => 
                  date > new Date() || 
                  isDateDisabledForFree(date)
                }
                className="rounded-xl"
              />
            </div>

            {/* Transactions for Selected Date */}
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h4>
              {filteredHistoryTransactions.length > 0 ? (
                filteredHistoryTransactions.map(t => (
                  <div key={t.id} className="bg-card rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-xs bg-secondary px-2 py-1 rounded-lg capitalize">
                        {t.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">
                        {t.items.length} items
                      </span>
                      <span className="font-bold text-primary">${t.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-card rounded-xl p-8 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No transactions on this date</p>
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <GlassNavigation />
    </div>
  );
};

export default Profile;
