import React, { useState } from 'react';
import { UserPlus, X, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { CartItem } from '@/components/CartItem';
import { GlassNavigation } from '@/components/GlassNavigation';
import { usePOS } from '@/context/POSContext';

const Cart: React.FC = () => {
  const { cart, cartTotal, customer, setCustomer } = usePOS();
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const navigate = useNavigate();

  const discount = cartTotal * 0.1; // 10% discount example
  const tax = 0;
  const total = cartTotal - discount + tax;

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

  if (cart.length === 0) {
    return (
      <div className="page-container bg-background">
        <PageHeader title="Cart" showBack />
        <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center">
          <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-4">
            <ShoppingCart className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some items to get started</p>
          <button
            onClick={() => navigate('/pos')}
            className="h-12 px-6 bg-foreground text-background font-semibold rounded-2xl hover:opacity-90 transition-all"
          >
            Browse Menu
          </button>
        </div>
        <GlassNavigation />
      </div>
    );
  }

  return (
    <div className="page-container bg-background">
      <PageHeader title="Current Order" showBack showMenu />

      <main className="px-4 space-y-4 pb-4">
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
            className="w-full h-14 bg-card border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            <span className="font-medium">Add Customer (Optional)</span>
          </button>
        )}

        {/* Cart Items */}
        <div className="space-y-3">
          {cart.map(item => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold text-foreground">Order Summary</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Item total</span>
              <span className="text-foreground">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount (10%)</span>
              <span className="text-success">-${discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="text-foreground">Free</span>
            </div>
          </div>

          <div className="border-t border-border pt-3 flex justify-between items-center">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={() => navigate('/checkout')}
          className="w-full h-14 bg-foreground text-background font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Proceed to Checkout
        </button>
      </main>

      <GlassNavigation />
    </div>
  );
};

export default Cart;
