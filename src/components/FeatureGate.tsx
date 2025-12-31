import React from 'react';
import { Lock, Crown, Zap } from 'lucide-react';
import { useSubscription, SubscriptionPlan } from '@/context/SubscriptionContext';

interface FeatureGateProps {
  feature: 'reportExport' | 'receiptExport' | 'dailyReport' | 'dailyBackup' | 'openCloseDaily' | 'multiOutlet' | 'splitView' | 'salesOrder';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

const FEATURE_LABELS: Record<string, string> = {
  reportExport: 'Export Reports',
  receiptExport: 'Print/Export Receipts',
  dailyReport: 'Daily Reports',
  dailyBackup: 'Daily Backup',
  openCloseDaily: 'Open/Close Shift',
  multiOutlet: 'Multi Outlet',
  splitView: 'Split View',
  salesOrder: 'Sales Order',
};

const FEATURE_REQUIRED_PLAN: Record<string, SubscriptionPlan> = {
  reportExport: 'pro',
  receiptExport: 'pro',
  dailyReport: 'basic',
  dailyBackup: 'basic',
  openCloseDaily: 'basic',
  multiOutlet: 'advance',
  splitView: 'advance',
  salesOrder: 'advance',
};

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
}) => {
  const { hasFeature, features } = useSubscription();

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  const requiredPlan = FEATURE_REQUIRED_PLAN[feature];

  return (
    <div className="bg-card border border-border rounded-2xl p-4 text-center space-y-3">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <Lock className="w-6 h-6 text-primary" />
      </div>
      <div>
        <p className="font-semibold text-foreground">{FEATURE_LABELS[feature]}</p>
        <p className="text-sm text-muted-foreground">
          Upgrade to {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} to unlock
        </p>
      </div>
      <button className="h-10 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:opacity-90 transition-all inline-flex items-center gap-2">
        <Crown className="w-4 h-4" />
        Upgrade Now
      </button>
    </div>
  );
};

export const TransactionLimitBanner: React.FC = () => {
  const { features, getRemainingTransactions, canMakeTransaction, currentPlan } = useSubscription();

  if (features.transactionLimit === null) return null;

  const remaining = getRemainingTransactions();
  const isLow = remaining !== null && remaining <= 5;
  const isExhausted = !canMakeTransaction();

  if (!isLow && !isExhausted) return null;

  return (
    <div className={`mx-4 mb-4 p-4 rounded-2xl flex items-center justify-between ${
      isExhausted 
        ? 'bg-destructive/10 border border-destructive/20' 
        : 'bg-warning/10 border border-warning/20'
    }`}>
      <div className="flex items-center gap-3">
        <Zap className={`w-5 h-5 ${isExhausted ? 'text-destructive' : 'text-warning'}`} />
        <div>
          <p className={`text-sm font-medium ${isExhausted ? 'text-destructive' : 'text-warning'}`}>
            {isExhausted 
              ? 'Transaction limit reached' 
              : `${remaining} transactions remaining`
            }
          </p>
          <p className="text-xs text-muted-foreground">
            {currentPlan === 'free' ? 'Free plan: 25/month' : ''}
          </p>
        </div>
      </div>
      <button className="h-8 px-3 bg-foreground text-background text-xs font-medium rounded-lg hover:opacity-90 transition-all">
        Upgrade
      </button>
    </div>
  );
};

export const PlanBadge: React.FC<{ plan?: SubscriptionPlan }> = ({ plan }) => {
  const { currentPlan, features } = useSubscription();
  const displayPlan = plan || currentPlan;
  
  const colors: Record<SubscriptionPlan, string> = {
    free: 'bg-muted text-muted-foreground',
    basic: 'bg-primary/10 text-primary',
    pro: 'bg-success/10 text-success',
    advance: 'bg-warning/10 text-warning',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[displayPlan]}`}>
      {features.name}
    </span>
  );
};
