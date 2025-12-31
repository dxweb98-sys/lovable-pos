import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { usePOS, CartItem as CartItemType } from '@/context/POSContext';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = usePOS();

  return (
    <div className="flex gap-4 p-4 bg-card rounded-2xl animate-fade-in">
      <div className="w-20 h-20 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-card-foreground">{item.name}</h3>
          <p className="text-sm text-muted-foreground">{item.quantity} items</p>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</span>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => removeFromCart(item.id)}
              className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2 bg-secondary rounded-full px-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:bg-muted transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-semibold">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:bg-muted transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
