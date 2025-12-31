import React, { useState } from 'react';
import { X, UserPlus, Minus, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePOS } from '@/context/POSContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CartModal: React.FC<CartModalProps> = ({ open, onOpenChange }) => {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto p-0 rounded-3xl bg-background border-border">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg font-bold text-foreground">Current Order</DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Customer Section */}
          {customer ? (
            <div className="bg-card rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-semibold text-foreground">{customer.name}</p>
                {customer.phone && (
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                )}
              </div>
              <button
                onClick={handleRemoveCustomer}
                className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : showCustomerForm ? (
            <div className="bg-card rounded-2xl p-4 space-y-3 animate-fade-in">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name"
                className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone (optional)"
                className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCustomerForm(false)}
                  className="flex-1 h-10 bg-secondary text-secondary-foreground font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomer}
                  className="flex-1 h-10 bg-foreground text-background font-medium rounded-xl"
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCustomerForm(true)}
              className="w-full h-12 bg-card border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              <span className="font-medium text-sm">Add Customer (Optional)</span>
            </button>
          )}

          {/* Cart Items */}
          {cart.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">🛒</span>
              </div>
              <p className="text-muted-foreground">Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="bg-card rounded-2xl p-3 flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{item.name}</p>
                    <p className="text-primary font-medium text-sm">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-foreground font-semibold w-5 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Order Summary */}
          {cart.length > 0 && (
            <>
              <div className="bg-card rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount (10%)</span>
                  <span className="text-success">-${discount.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between items-center">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-lg font-bold text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full h-14 bg-foreground text-background font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Proceed to Checkout
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
