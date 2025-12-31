import React, { useState } from 'react';
import { Store, CreditCard, Receipt, Save, ChevronRight, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { GlassNavigation } from '@/components/GlassNavigation';
import { useSubscription } from '@/context/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';

interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeLogo: string;
}

interface PaymentSettings {
  cashEnabled: boolean;
  cardEnabled: boolean;
  qrisEnabled: boolean;
  qrisName: string;
  qrisMerchantId: string;
}

interface ReceiptSettings {
  showLogo: boolean;
  footerText: string;
  showAddress: boolean;
  showPhone: boolean;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'store' | 'payment' | 'receipt'>('store');
  const { currentPlan, features } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: 'QuickPOS Store',
    storeAddress: 'Jl. Sudirman No. 123, Jakarta',
    storePhone: '+62 812 3456 7890',
    storeLogo: '🏪',
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    cashEnabled: true,
    cardEnabled: true,
    qrisEnabled: true,
    qrisName: 'QuickPOS Store',
    qrisMerchantId: 'ID2023123456789',
  });

  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>({
    showLogo: true,
    footerText: 'Thank you for your purchase!',
    showAddress: true,
    showPhone: true,
  });

  const handleSave = () => {
    toast({
      title: 'Settings saved!',
      description: 'Your settings have been updated successfully.',
    });
  };

  const tabs = [
    { id: 'store', label: 'Store', icon: Store },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'receipt', label: 'Receipt', icon: Receipt },
  ];

  return (
    <div className="page-container bg-background">
      <PageHeader title="Settings" showBack />

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="bg-secondary rounded-2xl p-1 flex">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'store' | 'payment' | 'receipt')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="px-4 space-y-4 pb-4">
        {/* Current Plan Card */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="font-semibold text-foreground capitalize">{currentPlan}</p>
            </div>
          </div>
          {currentPlan === 'free' && (
            <button
              onClick={() => navigate('/subscription')}
              className="h-10 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-xl flex items-center gap-2"
            >
              Upgrade
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Store Settings Tab */}
        {activeTab === 'store' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-card rounded-2xl p-4 space-y-4">
              <h3 className="font-semibold text-foreground">Store Profile</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Store Logo (Emoji)</label>
                  <input
                    type="text"
                    value={storeSettings.storeLogo}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeLogo: e.target.value })}
                    className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground text-2xl text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Store Name</label>
                  <input
                    type="text"
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                    className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Your store name"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Address</label>
                  <textarea
                    value={storeSettings.storeAddress}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
                    className="w-full h-20 px-4 py-3 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    placeholder="Store address"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Phone Number</label>
                  <input
                    type="tel"
                    value={storeSettings.storePhone}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storePhone: e.target.value })}
                    className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="+62 xxx xxxx xxxx"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Settings Tab */}
        {activeTab === 'payment' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-card rounded-2xl p-4 space-y-4">
              <h3 className="font-semibold text-foreground">Payment Methods</h3>
              
              <div className="space-y-3">
                {/* Cash */}
                <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💵</span>
                    <span className="font-medium text-foreground">Cash</span>
                  </div>
                  <button
                    onClick={() => setPaymentSettings({ ...paymentSettings, cashEnabled: !paymentSettings.cashEnabled })}
                    className={`w-12 h-7 rounded-full transition-colors ${
                      paymentSettings.cashEnabled ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-background rounded-full transition-transform ${
                      paymentSettings.cashEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Card */}
                <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💳</span>
                    <span className="font-medium text-foreground">Card</span>
                  </div>
                  <button
                    onClick={() => setPaymentSettings({ ...paymentSettings, cardEnabled: !paymentSettings.cardEnabled })}
                    className={`w-12 h-7 rounded-full transition-colors ${
                      paymentSettings.cardEnabled ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-background rounded-full transition-transform ${
                      paymentSettings.cardEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* QRIS */}
                <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📱</span>
                    <span className="font-medium text-foreground">QRIS</span>
                  </div>
                  <button
                    onClick={() => setPaymentSettings({ ...paymentSettings, qrisEnabled: !paymentSettings.qrisEnabled })}
                    className={`w-12 h-7 rounded-full transition-colors ${
                      paymentSettings.qrisEnabled ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-background rounded-full transition-transform ${
                      paymentSettings.qrisEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* QRIS Settings */}
            {paymentSettings.qrisEnabled && (
              <div className="bg-card rounded-2xl p-4 space-y-4 animate-fade-in">
                <h3 className="font-semibold text-foreground">QRIS Settings</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Merchant Name</label>
                    <input
                      type="text"
                      value={paymentSettings.qrisName}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, qrisName: e.target.value })}
                      className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Merchant name"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Merchant ID</label>
                    <input
                      type="text"
                      value={paymentSettings.qrisMerchantId}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, qrisMerchantId: e.target.value })}
                      className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Merchant ID"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Receipt Settings Tab */}
        {activeTab === 'receipt' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-card rounded-2xl p-4 space-y-4">
              <h3 className="font-semibold text-foreground">Receipt Settings</h3>
              
              <div className="space-y-3">
                {/* Show Logo */}
                <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                  <span className="font-medium text-foreground">Show Store Logo</span>
                  <button
                    onClick={() => setReceiptSettings({ ...receiptSettings, showLogo: !receiptSettings.showLogo })}
                    className={`w-12 h-7 rounded-full transition-colors ${
                      receiptSettings.showLogo ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-background rounded-full transition-transform ${
                      receiptSettings.showLogo ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Show Address */}
                <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                  <span className="font-medium text-foreground">Show Address</span>
                  <button
                    onClick={() => setReceiptSettings({ ...receiptSettings, showAddress: !receiptSettings.showAddress })}
                    className={`w-12 h-7 rounded-full transition-colors ${
                      receiptSettings.showAddress ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-background rounded-full transition-transform ${
                      receiptSettings.showAddress ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Show Phone */}
                <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                  <span className="font-medium text-foreground">Show Phone Number</span>
                  <button
                    onClick={() => setReceiptSettings({ ...receiptSettings, showPhone: !receiptSettings.showPhone })}
                    className={`w-12 h-7 rounded-full transition-colors ${
                      receiptSettings.showPhone ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-background rounded-full transition-transform ${
                      receiptSettings.showPhone ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Footer Text */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Footer Text</label>
                  <textarea
                    value={receiptSettings.footerText}
                    onChange={(e) => setReceiptSettings({ ...receiptSettings, footerText: e.target.value })}
                    className="w-full h-20 px-4 py-3 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    placeholder="Thank you message..."
                  />
                </div>
              </div>
            </div>

            {/* Receipt Export - Feature Gated */}
            {!features.receiptExport && (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Crown className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Receipt Export</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upgrade to Pro to export and print receipts.
                    </p>
                    <button
                      onClick={() => navigate('/subscription')}
                      className="mt-3 h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-xl"
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full h-14 bg-foreground text-background font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </main>

      <GlassNavigation />
    </div>
  );
};

export default Settings;
