import React, { useState } from 'react';
import { 
  User, 
  Store, 
  Settings, 
  LogOut, 
  Square, 
  ChevronRight, 
  Crown, 
  Lock,
  Mail,
  Building2,
  CreditCard,
  Receipt,
  DollarSign,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { GlassNavigation } from '@/components/GlassNavigation';
import { usePOS } from '@/context/POSContext';
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

const Profile: React.FC = () => {
  const [showCloseShift, setShowCloseShift] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [closingCash, setClosingCash] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { currentShift, closeShift } = usePOS();
  const { user, profile, signOut } = useAuth();
  const { currentPlan } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalSales = currentShift?.transactions.reduce((sum, t) => sum + t.total, 0) || 0;
  const transactionCount = currentShift?.transactions.length || 0;

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(closingCash) || 0;
    closeShift(amount);
    setShowCloseShift(false);
    setClosingCash('');
    toast({
      title: 'Shift closed!',
      description: 'You can now view reports.',
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
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }

    setIsUpdating(false);
  };

  const menuItems = [
    {
      icon: Building2,
      label: 'Business Settings',
      description: 'Store profile, address, phone',
      action: () => navigate('/settings', { state: { tab: 'store' } }),
    },
    {
      icon: CreditCard,
      label: 'Payment Settings',
      description: 'Payment methods, QRIS',
      action: () => navigate('/settings', { state: { tab: 'payment' } }),
    },
    {
      icon: Receipt,
      label: 'Receipt Settings',
      description: 'Receipt customization',
      action: () => navigate('/settings', { state: { tab: 'receipt' } }),
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

      {/* Close Shift Drawer */}
      <Drawer open={showCloseShift} onOpenChange={setShowCloseShift}>
        <DrawerContent className="max-h-[85vh] rounded-t-3xl">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-xl font-bold text-center">Close Shift</DrawerTitle>
          </DrawerHeader>

          <form onSubmit={handleCloseShift} className="px-4 pb-8 space-y-4">
            <div className="bg-secondary/50 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Sales</span>
                <span className="font-semibold text-foreground">${totalSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transactions</span>
                <span className="font-semibold text-foreground">{transactionCount}</span>
              </div>
            </div>

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
