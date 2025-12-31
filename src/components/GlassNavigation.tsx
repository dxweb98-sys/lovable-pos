import React from 'react';
import { Home, ShoppingCart, LayoutGrid, FileText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePOS } from '@/context/POSContext';

const navItems = [
  { icon: Home, label: 'POS', path: '/pos' },
  { icon: ShoppingCart, label: 'Cart', path: '/cart' },
  { icon: LayoutGrid, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'Reports', path: '/reports' },
];

export const GlassNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, currentShift } = usePOS();

  const isShiftClosed = currentShift && !currentShift.isOpen;

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 safe-area-bottom">
      <div className="glass-nav rounded-3xl px-2 py-3 flex items-center justify-around max-w-md mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          const isDisabled = isShiftClosed && (path === '/pos' || path === '/cart');
          
          return (
            <button
              key={path}
              onClick={() => !isDisabled && navigate(path)}
              disabled={isDisabled}
              className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200 ${
                isActive 
                  ? 'bg-foreground text-background' 
                  : isDisabled
                  ? 'text-muted-foreground/40 cursor-not-allowed'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
              {path === '/cart' && cartCount > 0 && !isDisabled && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                  {cartCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
