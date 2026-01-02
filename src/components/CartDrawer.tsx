import React, { useState } from 'react';
import { X, UserPlus, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePOS } from '@/context/POSContext';
import { ResponsiveModalLarge } from '@/components/ResponsiveModal';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ open, onOpenChange }) => {
  const { cart, cartTotal, customer, setCustomer, updateQuantity, removeFromCart } = usePOS();
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const navigate = useNavigate();

  const discount = cartTotal * 0.1;
  const total = cartTotal - discount;

  const handleAddCustomer = () => {
    if (customerName.trim()) {
      setCustomer({
        id: Date.now().toString(),
        name: customerName,
        phone: customerPhone || undefined,
      });
      setShowCustomerForm(false);
      setCustomerName('');
      setCustomerPhone('');
    }
  };

  const handleRemoveCustomer = () => {
    setCustomer(null);
  };

  const handleCheckout = () => {
    onOpenChange(false);
    navigate('/checkout');
  };

  return (
    <ResponsiveModalLarge open={open} onOpenChange={onOpenChange} title="Current Order">
      <div className="space-y-4">
        {/* Customer Section */}
        {customer ? (
          <div className="bg-secondary/50 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Customer</p>
              <p className="font-semibold text-foreground">{customer.name}</p>
              {customer.phone && (
                <p className="text-sm text-muted-foreground">{customer.phone}</p>
              )}
            </div>
            <button
              onClick={handleRemoveCustomer}
              className="w-9 h-9 rounded-full bg-destructive/10 text-destructive flex items-center justify-center active:scale-95 transition-transform"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : showCustomerForm ? (
          <div className="bg-secondary/50 rounded-2xl p-4 space-y-3 animate-fade-in">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
              className="w-full h-12 px-4 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Phone (optional)"
              className="w-full h-12 px-4 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCustomerForm(false)}
                className="flex-1 h-11 bg-muted text-muted-foreground font-medium rounded-xl active:scale-98 transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomer}
                className="flex-1 h-11 bg-foreground text-background font-medium rounded-xl active:scale-98 transition-transform"
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCustomerForm(true)}
            className="w-full h-14 bg-secondary/50 border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary active:scale-98 transition-all"
          >
            <UserPlus className="w-5 h-5" />
            <span className="font-medium">Add Customer (Optional)</span>
          </button>
        )}

        {/* Cart Items */}
        {cart.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">Cart is empty</p>
            <p className="text-muted-foreground/60 text-sm mt-1">Add items from the menu</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cart.map(item => (
              <div key={item.id} className="bg-secondary/30 rounded-2xl p-3 flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{item.name}</p>
                  <p className="text-primary font-bold">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-foreground font-bold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 active:scale-95 transition-all ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Summary */}
        {cart.length > 0 && (
          <>
            <div className="bg-secondary/30 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground font-medium">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount (10%)</span>
                <span className="text-success font-medium">-${discount.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full h-14 bg-primary text-primary-foreground font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all btn-primary-glow"
            >
              Proceed to Checkout
            </button>
          </>
        )}
      </div>
    </ResponsiveModalLarge>
  );
};
