import React, { useState } from 'react';
import { Home, ShoppingBag, LayoutDashboard, BarChart3, Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePOS } from '@/context/POSContext';
import { CartDrawer } from '@/components/CartDrawer';

const navItems = [
  { icon: Home, label: 'POS', path: '/pos' },
  { icon: LayoutDashboard, label: 'Menu', path: '/dashboard' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
];

export const GlassNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, currentShift } = usePOS();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const isShiftClosed = currentShift && !currentShift.isOpen;
  const isCartDisabled = isShiftClosed;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
        <div className="bg-background/80 backdrop-blur-2xl border-t border-border/30 shadow-2xl">
          <div className="flex items-center justify-around max-w-lg mx-auto px-4 relative">
            {/* Left nav items */}
            {navItems.slice(0, 2).map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path;
              const isDisabled = isShiftClosed && path === '/pos';
              
              return (
                <button
                  key={path}
                  onClick={() => !isDisabled && navigate(path)}
                  disabled={isDisabled}
                  className={`flex flex-col items-center gap-0.5 py-3 min-w-[60px] transition-all duration-300 ${
                    isActive 
                      ? 'text-primary' 
                      : isDisabled
                      ? 'text-muted-foreground/30 cursor-not-allowed'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className={`w-6 h-6 transition-all duration-300 ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                    {label}
                  </span>
                  {isActive && (
                    <div className="absolute -top-0.5 w-12 h-1 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}

            {/* Center Cart Button */}
            <div className="relative -mt-8">
              <button
                onClick={() => !isCartDisabled && setIsCartOpen(true)}
                disabled={isCartDisabled}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 active:scale-95 ${
                  isCartDisabled
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:shadow-2xl hover:scale-105'
                }`}
                style={{
                  boxShadow: isCartDisabled ? 'none' : '0 8px 32px -4px hsl(var(--primary) / 0.4)',
                }}
              >
                <ShoppingBag className="w-7 h-7" strokeWidth={2} />
                {cartCount > 0 && !isCartDisabled && (
                  <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center px-1 shadow-lg animate-scale-in">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
              <span className={`block text-[10px] font-medium text-center mt-1.5 ${isCartDisabled ? 'text-muted-foreground/30' : 'text-foreground'}`}>
                Cart
              </span>
            </div>

            {/* Right nav items */}
            {navItems.slice(2).map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path;
              
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`flex flex-col items-center gap-0.5 py-3 min-w-[60px] transition-all duration-300 ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className={`w-6 h-6 transition-all duration-300 ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                    {label}
                  </span>
                  {isActive && (
                    <div className="absolute -top-0.5 w-12 h-1 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
};
