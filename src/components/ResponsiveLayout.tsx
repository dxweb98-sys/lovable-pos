import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { GlassNavigation } from '@/components/GlassNavigation';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { CartDrawer } from '@/components/CartDrawer';
import { usePOS } from '@/context/POSContext';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  showNav = true 
}) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartCount } = usePOS();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      {showNav && <DesktopSidebar />}
      
      {/* Main Content */}
      <div className={showNav ? 'md:ml-64 lg:ml-72' : ''}>
        {children}
      </div>
      
      {/* Mobile Navigation - hidden on desktop */}
      {showNav && (
        <div className="md:hidden">
          <GlassNavigation />
        </div>
      )}

      {/* Floating Cart Button for Desktop - hidden on mobile */}
      {showNav && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="hidden md:flex fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-primary text-primary-foreground items-center justify-center shadow-xl hover:scale-105 hover:shadow-2xl transition-all"
          style={{
            boxShadow: '0 8px 32px -4px hsl(var(--primary) / 0.5)',
          }}
        >
          <ShoppingBag className="w-7 h-7" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[24px] h-6 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center px-1.5 shadow-lg">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>
      )}

      {/* Cart Modal/Drawer */}
      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </div>
  );
};
