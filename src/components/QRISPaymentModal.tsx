import React, { useState, useEffect } from 'react';
import { CheckCircle, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface QRISPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  onPaymentComplete: () => void;
}

export const QRISPaymentModal: React.FC<QRISPaymentModalProps> = ({
  open,
  onOpenChange,
  amount,
  onPaymentComplete,
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const { toast } = useToast();

  // Generate a simple QRIS-like code (demo purposes)
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
    // Simulate payment check - in real app, this would call API
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
    // Demo: simulate successful payment
    setIsConfirmed(true);
    setTimeout(() => {
      onPaymentComplete();
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 rounded-3xl bg-background border-border">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg font-bold text-foreground text-center">
            QRIS Payment
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {isConfirmed ? (
            <div className="text-center py-8 space-y-4 animate-scale-in">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">Payment Confirmed!</p>
                <p className="text-muted-foreground text-sm">Transaction successful</p>
              </div>
            </div>
          ) : (
            <>
              {/* Amount Display */}
              <div className="bg-primary/10 rounded-2xl p-4 text-center">
                <p className="text-sm text-muted-foreground">Amount to Pay</p>
                <p className="text-3xl font-bold text-primary">Rp {amount.toLocaleString('id-ID')}</p>
              </div>

              {/* QR Code */}
              <div className="bg-card rounded-2xl p-4 flex flex-col items-center">
                <div className="w-48 h-48 bg-background rounded-xl flex items-center justify-center border-2 border-border mb-3">
                  {/* SVG QR Code placeholder */}
                  <svg
                    viewBox="0 0 100 100"
                    className="w-40 h-40"
                  >
                    {/* QR code pattern - simplified representation */}
                    <rect x="10" y="10" width="20" height="20" fill="currentColor" className="text-foreground" />
                    <rect x="70" y="10" width="20" height="20" fill="currentColor" className="text-foreground" />
                    <rect x="10" y="70" width="20" height="20" fill="currentColor" className="text-foreground" />
                    
                    {/* Inner patterns */}
                    <rect x="15" y="15" width="10" height="10" fill="currentColor" className="text-background" />
                    <rect x="75" y="15" width="10" height="10" fill="currentColor" className="text-background" />
                    <rect x="15" y="75" width="10" height="10" fill="currentColor" className="text-background" />
                    
                    {/* Center patterns */}
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
                <p className="text-xs text-muted-foreground text-center">
                  Scan with any QRIS-enabled app
                </p>
              </div>

              {/* Countdown */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Expires in <span className="font-semibold text-warning">{formatCountdown(countdown)}</span>
                </p>
              </div>

              {/* Copy Code Button */}
              <button
                onClick={handleCopyCode}
                className="w-full h-12 bg-secondary text-secondary-foreground font-medium rounded-2xl hover:bg-muted transition-all flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy QRIS Code
              </button>

              {/* Check Payment Button */}
              <button
                onClick={handleCheckPayment}
                disabled={isChecking}
                className="w-full h-12 bg-card border border-border text-foreground font-medium rounded-2xl hover:bg-secondary transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                {isChecking ? 'Checking...' : 'Check Payment Status'}
              </button>

              {/* Simulate Payment (Demo) */}
              <button
                onClick={handleSimulatePayment}
                className="w-full h-14 bg-primary text-primary-foreground font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all btn-primary-glow"
              >
                Simulate Payment (Demo)
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
