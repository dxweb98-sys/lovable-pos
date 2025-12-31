import React, { useState } from 'react';
import { CreditCard, Banknote, Smartphone, CheckCircle, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { FeatureGate } from '@/components/FeatureGate';
import { usePOS } from '@/context/POSContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';

const paymentMethods = [
  { id: 'cash', label: 'Cash', icon: Banknote, description: 'Pay with cash' },
  { id: 'card', label: 'Card', icon: CreditCard, description: 'Credit or debit card' },
  { id: 'digital', label: 'Digital', icon: Smartphone, description: 'E-wallet payment' },
];

const Checkout: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { cart, cartTotal, customer, addTransaction } = usePOS();
  const { canMakeTransaction, incrementTransactionCount, hasFeature } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  const discount = cartTotal * 0.1;
  const tax = 0;
  const total = cartTotal - discount + tax;

  const handlePayment = () => {
    if (!canMakeTransaction()) {
      toast({
        title: 'Transaction limit reached',
        description: 'Upgrade your plan to continue making transactions.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      addTransaction({
        items: cart,
        customer: customer || undefined,
        subtotal: cartTotal,
        discount,
        tax,
        total,
        paymentMethod: selectedMethod,
      });

      incrementTransactionCount();
      setIsProcessing(false);
      setIsComplete(true);

      toast({
        title: 'Payment successful!',
        description: `Transaction completed: $${total.toFixed(2)}`,
      });
    }, 1500);
  };

  const handlePrintReceipt = () => {
    if (!hasFeature('receiptExport')) {
      toast({
        title: 'Feature locked',
        description: 'Upgrade to Pro to print receipts.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Receipt printed!',
      description: 'Receipt has been sent to printer.',
    });
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 animate-scale-in w-full max-w-sm">
          <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payment Successful!</h1>
            <p className="text-muted-foreground mt-2">Transaction has been recorded</p>
          </div>
          <div className="bg-card rounded-2xl p-6 w-full">
            <p className="text-sm text-muted-foreground">Amount Paid</p>
            <p className="text-3xl font-bold text-foreground">${total.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-2 capitalize">{selectedMethod} payment</p>
          </div>

          {/* Print Receipt - Feature Gated */}
          <FeatureGate feature="receiptExport" showUpgradePrompt={false}>
            <button
              onClick={handlePrintReceipt}
              className="w-full h-12 bg-secondary text-secondary-foreground font-medium rounded-2xl hover:bg-muted transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print Receipt
            </button>
          </FeatureGate>

          <button
            onClick={() => navigate('/pos')}
            className="w-full h-14 bg-foreground text-background font-semibold rounded-2xl hover:opacity-90 transition-all"
          >
            New Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <PageHeader title="Payment" showBack />

      <main className="px-4 space-y-6">
        {/* Order Summary */}
        <div className="bg-card rounded-2xl p-4">
          <h3 className="font-semibold text-foreground mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{cart.length} items</span>
              <span className="text-foreground">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-success">-${discount.toFixed(2)}</span>
            </div>
          </div>
          <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Payment Method</h3>
          {paymentMethods.map(method => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${
                  isSelected 
                    ? 'bg-foreground text-background' 
                    : 'bg-card text-card-foreground hover:bg-secondary'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-background/20' : 'bg-secondary'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">{method.label}</p>
                  <p className={`text-sm ${isSelected ? 'opacity-70' : 'text-muted-foreground'}`}>
                    {method.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing || !canMakeTransaction()}
          className="w-full h-14 bg-primary text-primary-foreground font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 btn-primary-glow"
        >
          {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
        </button>
      </main>
    </div>
  );
};

export default Checkout;
