import React, { useState, useEffect } from 'react';
import { CheckCircle, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface QRISPaymentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  onPaymentComplete: () => void;
}

export const QRISPaymentDrawer: React.FC<QRISPaymentDrawerProps> = ({
  open,
  onOpenChange,
  amount,
  onPaymentComplete,
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const { toast } = useToast();

  const qrisCode = `00020101021126620014ID.CO.QRIS.WWW0215ID20${Date.now().toString().slice(-8)}0303UMI51440014ID.CO.QRIS.WWW0215ID20${Date.now().toString().slice(-8)}5303360540${amount.toFixed(0)}5802ID5913QuickPOS Store6015Jakarta Selatan61051234062070703A016304`;

  useEffect(() => {
    if (!open) {
      setIsConfirmed(false);
      setCountdown(300);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(qrisCode);
    toast({
      title: 'Copied!',
      description: 'QRIS code copied to clipboard',
    });
  };

  const handleCheckPayment = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      setIsConfirmed(true);
      setTimeout(() => {
        onPaymentComplete();
        onOpenChange(false);
      }, 1500);
    }, 2000);
  };

  const handleSimulatePayment = () => {
    setIsConfirmed(true);
    setTimeout(() => {
      onPaymentComplete();
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] rounded-t-3xl">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-xl font-bold text-center">QRIS Payment</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-8 space-y-4">
          {isConfirmed ? (
            <div className="text-center py-12 space-y-4 animate-scale-in">
              <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-14 h-14 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">Payment Confirmed!</p>
                <p className="text-muted-foreground mt-1">Transaction successful</p>
              </div>
            </div>
          ) : (
            <>
              {/* Amount Display */}
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-6 text-center">
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Amount to Pay</p>
                <p className="text-4xl font-bold text-foreground mt-1">Rp {amount.toLocaleString('id-ID')}</p>
              </div>

              {/* QR Code */}
              <div className="bg-secondary/30 rounded-3xl p-6 flex flex-col items-center">
                <div className="w-52 h-52 bg-background rounded-2xl flex items-center justify-center border-2 border-border mb-4 shadow-inner">
                  <svg viewBox="0 0 100 100" className="w-44 h-44">
                    <rect x="10" y="10" width="20" height="20" fill="currentColor" className="text-foreground" />
                    <rect x="70" y="10" width="20" height="20" fill="currentColor" className="text-foreground" />
                    <rect x="10" y="70" width="20" height="20" fill="currentColor" className="text-foreground" />
                    <rect x="15" y="15" width="10" height="10" fill="currentColor" className="text-background" />
                    <rect x="75" y="15" width="10" height="10" fill="currentColor" className="text-background" />
                    <rect x="15" y="75" width="10" height="10" fill="currentColor" className="text-background" />
                    <rect x="35" y="10" width="5" height="5" fill="currentColor" className="text-foreground" />
                    <rect x="45" y="10" width="10" height="5" fill="currentColor" className="text-foreground" />
                    <rect x="35" y="20" width="10" height="5" fill="currentColor" className="text-foreground" />
                    <rect x="50" y="20" width="5" height="5" fill="currentColor" className="text-foreground" />
                    <rect x="10" y="35" width="5" height="5" fill="currentColor" className="text-foreground" />
                    <rect x="20" y="35" width="5" height="10" fill="currentColor" className="text-foreground" />
                    <rect x="10" y="45" width="10" height="5" fill="currentColor" className="text-foreground" />
                    <rect x="10" y="55" width="5" height="10" fill="currentColor" className="text-foreground" />
                    <rect x="35" y="35" width="30" height="30" fill="currentColor" className="text-foreground" />
                    <rect x="40" y="40" width="20" height="20" fill="currentColor" className="text-background" />
                    <rect x="45" y="45" width="10" height="10" fill="currentColor" className="text-foreground" />
                    <rect x="70" y="35" width="5" height="5" fill="currentColor" className="text-foreground" />
                    <rect x="80" y="35" width="10" height="5" fill="currentColor" className="text-foreground" />
                    <rect x="70" y="45" width="10" height="5" fill="currentColor" className="text-foreground" />
                    <rect x="85" y="45" width="5" height="10" fill="currentColor" className="text-foreground" />
                    <rect x="70" y="70" width="5" height="5" fill="currentColor" className="text-foreground" />
                    <rect x="80" y="70" width="10" height="5" fill="currentColor" className="text-foreground" />
                    <rect x="70" y="80" width="10" height="5" fill="currentColor" className="text-foreground" />
                    <rect x="85" y="80" width="5" height="10" fill="currentColor" className="text-foreground" />
                    <rect x="35" y="70" width="5" height="5" fill="currentColor" className="text-foreground" />
                    <rect x="45" y="75" width="10" height="5" fill="currentColor" className="text-foreground" />
                    <rect x="35" y="85" width="15" height="5" fill="currentColor" className="text-foreground" />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Scan with any QRIS-enabled app
                </p>
              </div>

              {/* Countdown */}
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground">
                  Expires in <span className="font-bold text-warning">{formatCountdown(countdown)}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCopyCode}
                  className="w-full h-12 bg-secondary text-foreground font-medium rounded-2xl hover:bg-muted active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy QRIS Code
                </button>

                <button
                  onClick={handleCheckPayment}
                  disabled={isChecking}
                  className="w-full h-12 bg-secondary/50 border border-border text-foreground font-medium rounded-2xl hover:bg-secondary active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                  {isChecking ? 'Checking...' : 'Check Payment Status'}
                </button>

                <button
                  onClick={handleSimulatePayment}
                  className="w-full h-14 bg-primary text-primary-foreground font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all btn-primary-glow"
                >
                  Simulate Payment (Demo)
                </button>
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
