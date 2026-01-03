import React from 'react';
import { Printer, X } from 'lucide-react';
import { ResponsiveModalLarge } from '@/components/ResponsiveModal';
import { CartItem, Customer } from '@/context/POSContext';

interface ReceiptDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  customer?: Customer;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  onPrint: () => void;
  onClose: () => void;
}

export const ReceiptDrawer: React.FC<ReceiptDrawerProps> = ({
  open,
  onOpenChange,
  items,
  customer,
  subtotal,
  discount,
  total,
  paymentMethod,
  onPrint,
  onClose,
}) => {
  const totalInRupiah = total * 15500;

  return (
    <ResponsiveModalLarge open={open} onOpenChange={onOpenChange} title="Receipt Preview">
      <div className="pt-4">
        {/* Receipt */}
        <div className="bg-white text-black rounded-2xl p-6 font-mono text-sm">
          {/* Header */}
          <div className="text-center border-b border-dashed border-gray-300 pb-4 mb-4">
            <h2 className="font-bold text-lg">QuickPOS</h2>
            <p className="text-xs text-gray-500">Point of Sale System</p>
            <p className="text-xs text-gray-500 mt-2">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-xs text-gray-500">
              {new Date().toLocaleTimeString('id-ID')}
            </p>
          </div>

          {/* Customer */}
          {customer && (
            <div className="border-b border-dashed border-gray-300 pb-3 mb-3">
              <p className="text-xs text-gray-500">Customer:</p>
              <p className="font-medium">{customer.name}</p>
              {customer.phone && <p className="text-xs">{customer.phone}</p>}
            </div>
          )}

          {/* Items */}
          <div className="space-y-2 border-b border-dashed border-gray-300 pb-4 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} x ${item.price.toFixed(2)}
                  </p>
                </div>
                <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2 mt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="text-center text-xs text-gray-500">
              ≈ Rp {totalInRupiah.toLocaleString('id-ID')}
            </div>
          </div>

          {/* Payment Method */}
          <div className="text-center mt-4 pt-4 border-t border-dashed border-gray-300">
            <p className="text-xs text-gray-500">Payment Method</p>
            <p className="font-medium capitalize">{paymentMethod}</p>
          </div>

          {/* Footer */}
          <div className="text-center mt-4 pt-4 border-t border-dashed border-gray-300">
            <p className="text-xs text-gray-500">Thank you for your purchase!</p>
            <p className="text-xs text-gray-500">Please come again</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 h-12 bg-secondary text-foreground font-medium rounded-2xl hover:bg-muted transition-all flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Skip
          </button>
          <button
            onClick={onPrint}
            className="flex-1 h-12 bg-primary text-primary-foreground font-medium rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Print
          </button>
        </div>
      </div>
    </ResponsiveModalLarge>
  );
};
