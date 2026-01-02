import React, { useState } from 'react';
import { GlassNavigation } from '@/components/GlassNavigation';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { CartDrawer } from '@/components/CartDrawer';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  showNav = true 
}) => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      {showNav && <DesktopSidebar onCartClick={() => setIsCartOpen(true)} />}
      
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

      {/* Cart Drawer for desktop sidebar */}
      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </div>
  );
};
