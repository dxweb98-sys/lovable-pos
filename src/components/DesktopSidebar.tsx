import React from 'react';
import { Home, LayoutDashboard, MinusCircle, User, ShoppingBag, Crown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSubscription } from '@/context/SubscriptionContext';

const navItems = [
  { icon: Home, label: 'POS', path: '/pos' },
  { icon: LayoutDashboard, label: 'Menu', path: '/dashboard' },
  { icon: MinusCircle, label: 'Expenses', path: '/expenses' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export const DesktopSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentPlan } = useSubscription();

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 h-screen bg-card border-r border-border fixed left-0 top-0 z-40">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">QuickPOS</h1>
            <p className="text-xs text-muted-foreground capitalize">{currentPlan} Plan</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
              <span className="font-medium">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Upgrade Banner (for free users) */}
      {currentPlan === 'free' && (
        <div className="p-4 border-t border-border">
          <button
            onClick={() => navigate('/subscription')}
            className="w-full p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl hover:from-primary/20 hover:to-primary/10 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground text-sm">Upgrade to Pro</p>
                <p className="text-xs text-muted-foreground">Unlock all features</p>
              </div>
            </div>
          </button>
        </div>
      )}
    </aside>
  );
};
