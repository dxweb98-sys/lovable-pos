import React, { useState } from 'react';
import { Home, ShoppingBag, LayoutDashboard, BarChart3, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePOS } from '@/context/POSContext';
import { CartDrawer } from '@/components/CartDrawer';

const leftNavItems = [
  { icon: Home, label: 'POS', path: '/pos' },
  { icon: LayoutDashboard, label: 'Menu', path: '/dashboard' },
];

const rightNavItems = [
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const GlassNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, currentShift } = usePOS();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const isShiftClosed = currentShift && !currentShift.isOpen;
  const isCartDisabled = isShiftClosed;

  const renderNavItem = ({ icon: Icon, label, path }: { icon: any; label: string; path: string }) => {
    const isActive = location.pathname === path;
    const isDisabled = isShiftClosed && path === '/pos';
    
    return (
      <button
        key={path}
        onClick={() => !isDisabled && navigate(path)}
        disabled={isDisabled}
        className={`flex flex-col items-center gap-0.5 py-3 flex-1 transition-all duration-300 ${
          isActive 
            ? 'text-primary' 
            : isDisabled
            ? 'text-muted-foreground/30 cursor-not-allowed'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 1.5} />
        <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <>
      <nav className="fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-background/80 backdrop-blur-2xl border border-border/50 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between max-w-lg mx-auto px-2 relative">
            {/* Left nav items */}
            <div className="flex items-center flex-1">
              {leftNavItems.map(renderNavItem)}
            </div>

            {/* Center Cart Button */}
            <div className="relative -mt-6 mx-2">
              <button
                onClick={() => !isCartDisabled && setIsCartOpen(true)}
                disabled={isCartDisabled}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 active:scale-95 ${
                  isCartDisabled
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:shadow-2xl hover:scale-105'
                }`}
                style={{
                  boxShadow: isCartDisabled ? 'none' : '0 8px 32px -4px hsl(var(--primary) / 0.5)',
                }}
              >
                <ShoppingBag className="w-6 h-6" strokeWidth={2} />
                {cartCount > 0 && !isCartDisabled && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg animate-scale-in">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Right nav items */}
            <div className="flex items-center flex-1">
              {rightNavItems.map(renderNavItem)}
            </div>
          </div>
        </div>
      </nav>

      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
};
