import React from 'react';
import { Home, ShoppingBag, LayoutDashboard, BarChart3, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePOS } from '@/context/POSContext';

const navItems = [
  { icon: Home, label: 'POS', path: '/pos' },
  { icon: ShoppingBag, label: 'Cart', path: '/cart' },
  { icon: LayoutDashboard, label: 'Menu', path: '/dashboard' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
];

export const GlassNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, currentShift } = usePOS();

  const isShiftClosed = currentShift && !currentShift.isOpen;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="bg-background/70 backdrop-blur-2xl border-t border-border/50 px-2 pt-2 pb-6">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            const isDisabled = isShiftClosed && (path === '/pos' || path === '/cart');
            
            return (
              <button
                key={path}
                onClick={() => !isDisabled && navigate(path)}
                disabled={isDisabled}
                className={`relative flex flex-col items-center gap-0.5 min-w-[64px] py-1.5 transition-all duration-300 ${
                  isActive 
                    ? 'text-primary' 
                    : isDisabled
                    ? 'text-muted-foreground/30 cursor-not-allowed'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className={`relative p-2 rounded-2xl transition-all duration-300 ${
                  isActive ? 'bg-primary/10' : ''
                }`}>
                  <Icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                  {path === '/cart' && cartCount > 0 && !isDisabled && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in px-1">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                  {isActive && (
                    <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-primary animate-pulse" />
                  )}
                </div>
                <span className={`text-[10px] font-medium transition-all duration-300 ${isActive ? 'text-primary font-semibold' : ''}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
