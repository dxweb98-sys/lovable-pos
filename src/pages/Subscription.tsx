import React, { useState } from 'react';
import { Check, X, Crown, Zap, Building2, Sparkles, QrCode } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { GlassNavigation } from '@/components/GlassNavigation';
import { useSubscription, PLAN_FEATURES, SubscriptionPlan } from '@/context/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

const plans: SubscriptionPlan[] = ['free', 'basic', 'pro', 'advance'];

const planIcons: Record<SubscriptionPlan, React.ReactNode> = {
  free: <Zap className="w-6 h-6" />,
  basic: <Sparkles className="w-6 h-6" />,
  pro: <Crown className="w-6 h-6" />,
  advance: <Building2 className="w-6 h-6" />,
};

const planColors: Record<SubscriptionPlan, string> = {
  free: 'bg-muted',
  basic: 'bg-primary',
  pro: 'bg-success',
  advance: 'bg-warning',
};

const planPricesRp: Record<SubscriptionPlan, number> = {
  free: 0,
  basic: 60000,
  pro: 120000,
  advance: 160000,
};

const Subscription: React.FC = () => {
  const { currentPlan, setPlan, monthlyTransactionCount, features } = useSubscription();
  const { toast } = useToast();
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const featureList = [
    { key: 'transactionLimit', label: 'Transaction Limit', format: (v: number | null) => v === null ? 'Unlimited' : `${v}/month` },
    { key: 'maxUsers', label: 'Users', format: (v: number) => v === 999 ? 'Unlimited' : `${v} user${v > 1 ? 's' : ''}` },
    { key: 'dailyReport', label: 'Daily Report' },
    { key: 'dailyBackup', label: 'Daily Backup' },
    { key: 'openCloseDaily', label: 'Open/Close Shift' },
    { key: 'reportExport', label: 'Export Reports' },
    { key: 'receiptExport', label: 'Print/Export Receipt' },
    { key: 'prioritySupport', label: 'Priority Support' },
    { key: 'multiOutlet', label: 'Multi Outlet' },
    { key: 'splitView', label: 'Owner/POS Split View' },
    { key: 'salesOrder', label: 'Sales Order (SO)' },
    { key: 'customFeatures', label: 'Custom Features' },
  ];

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    if (plan === currentPlan) return;
    
    if (plan === 'free') {
      // Downgrade to free - just set it
      setPlan(plan);
      toast({
        title: 'Plan changed',
        description: 'You are now on the Free plan.',
      });
      return;
    }
    
    // Show payment drawer for upgrade
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handlePaymentConfirm = () => {
    if (!selectedPlan) return;
    
    setIsProcessing(true);
    
    // Simulate QRIS payment processing
    setTimeout(() => {
      setPlan(selectedPlan);
      setIsProcessing(false);
      setShowPayment(false);
      setSelectedPlan(null);
      
      toast({
        title: 'Payment successful!',
        description: `You are now on the ${PLAN_FEATURES[selectedPlan].name} plan.`,
      });
    }, 2000);
  };

  return (
    <div className="page-container bg-background">
      <PageHeader title="Subscription" showBack />

      <main className="px-4 space-y-6 pb-4">
        {/* Current Plan Status */}
        <div className="bg-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${planColors[currentPlan]} rounded-xl flex items-center justify-center text-background`}>
                {planIcons[currentPlan]}
              </div>
              <div>
                <p className="font-semibold text-foreground">{features.name} Plan</p>
                <p className="text-sm text-muted-foreground">{features.price}</p>
              </div>
            </div>
          </div>

          {features.transactionLimit !== null && (
            <div className="bg-secondary rounded-xl p-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Transactions used</span>
                <span className="font-medium text-foreground">
                  {monthlyTransactionCount} / {features.transactionLimit}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (monthlyTransactionCount / features.transactionLimit) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Plan Cards */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Choose Plan</h3>
          
          {plans.map(plan => {
            const planFeatures = PLAN_FEATURES[plan];
            const isActive = currentPlan === plan;
            const isUpgrade = plans.indexOf(plan) > plans.indexOf(currentPlan);
            
            return (
              <button
                key={plan}
                onClick={() => handlePlanSelect(plan)}
                className={`w-full p-4 rounded-2xl text-left transition-all ${
                  isActive 
                    ? 'bg-foreground text-background ring-2 ring-foreground' 
                    : 'bg-card text-card-foreground hover:bg-secondary'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-background/20' : planColors[plan] + ' text-background'
                    }`}>
                      {planIcons[plan]}
                    </div>
                    <div>
                      <p className="font-semibold">{planFeatures.name}</p>
                      <p className={`text-sm ${isActive ? 'opacity-70' : 'text-muted-foreground'}`}>
                        {planFeatures.price}
                      </p>
                    </div>
                  </div>
                  {isActive ? (
                    <span className="px-2 py-1 bg-background/20 rounded-full text-xs font-medium">
                      Current
                    </span>
                  ) : isUpgrade && plan !== 'free' ? (
                    <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                      Upgrade
                    </span>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span className={isActive ? 'opacity-80' : 'text-muted-foreground'}>
                      {planFeatures.transactionLimit === null ? 'Unlimited' : planFeatures.transactionLimit} txn
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span className={isActive ? 'opacity-80' : 'text-muted-foreground'}>
                      {planFeatures.maxUsers === 999 ? '∞' : planFeatures.maxUsers} user{planFeatures.maxUsers > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <div className="bg-card rounded-2xl p-4">
          <h3 className="font-semibold text-foreground mb-4">Feature Comparison</h3>
          
          <div className="space-y-3">
            {featureList.map(feature => {
              const value = features[feature.key as keyof typeof features];
              const isBoolean = typeof value === 'boolean';
              
              return (
                <div key={feature.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-foreground">{feature.label}</span>
                  {isBoolean ? (
                    value ? (
                      <Check className="w-5 h-5 text-success" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground" />
                    )
                  ) : (
                    <span className="text-sm font-medium text-foreground">
                      {feature.format ? feature.format(value as number | null) : value}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Payment Drawer */}
      <Drawer open={showPayment} onOpenChange={setShowPayment}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b border-border pb-4">
            <DrawerTitle className="text-center">
              Upgrade to {selectedPlan ? PLAN_FEATURES[selectedPlan].name : ''} Plan
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="p-4 space-y-6">
            {/* Plan Summary */}
            {selectedPlan && (
              <div className="bg-secondary/30 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 ${planColors[selectedPlan]} rounded-xl flex items-center justify-center text-background`}>
                    {planIcons[selectedPlan]}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{PLAN_FEATURES[selectedPlan].name} Plan</p>
                    <p className="text-sm text-muted-foreground">{PLAN_FEATURES[selectedPlan].price}</p>
                  </div>
                </div>
                
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="text-2xl font-bold text-foreground">
                      Rp {planPricesRp[selectedPlan].toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* QRIS Payment */}
            <div className="text-center space-y-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Scan QRIS to pay</p>
              
              {/* Mock QR Code */}
              <div className="bg-white p-6 rounded-2xl inline-block mx-auto">
                <div className="w-48 h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-8 gap-1">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-sm ${Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Supports GoPay, OVO, Dana, ShopeePay, and other QRIS-compatible apps
              </p>
            </div>

            {/* Confirm Button (simulates payment received) */}
            <button
              onClick={handlePaymentConfirm}
              disabled={isProcessing}
              className="w-full h-14 bg-primary text-primary-foreground font-semibold rounded-2xl hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isProcessing ? 'Processing Payment...' : 'I Have Paid'}
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      <GlassNavigation />
    </div>
  );
};

export default Subscription;
