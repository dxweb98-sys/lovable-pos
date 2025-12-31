import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { usePOS } from '@/context/POSContext';

interface FloatingCartButtonProps {
  onClick: () => void;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ onClick }) => {
  const { cartCount, cartTotal, currentShift } = usePOS();

  const isShiftClosed = currentShift && !currentShift.isOpen;

  if (cartCount === 0 || isShiftClosed) return null;

  return (
    <button
      onClick={onClick}
      className="floating-cart flex items-center justify-between animate-slide-up"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-foreground">
          {cartCount} {cartCount === 1 ? 'item' : 'items'} selected
        </span>
      </div>
      <span className="text-lg font-bold text-primary">${cartTotal.toFixed(2)}</span>
    </button>
  );
};
