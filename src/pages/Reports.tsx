import React from 'react';
import { Calendar, DollarSign, ShoppingBag, TrendingUp, Clock, CreditCard } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { GlassNavigation } from '@/components/GlassNavigation';
import { usePOS } from '@/context/POSContext';

const Reports: React.FC = () => {
  const { currentShift, transactions } = usePOS();

  const todayTransactions = transactions.filter(t => {
    const today = new Date();
    const transactionDate = new Date(t.timestamp);
    return transactionDate.toDateString() === today.toDateString();
  });

  const totalSales = todayTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalItems = todayTransactions.reduce((sum, t) => 
    sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );
  const avgTransaction = todayTransactions.length > 0 ? totalSales / todayTransactions.length : 0;

  const paymentBreakdown = {
    cash: todayTransactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.total, 0),
    card: todayTransactions.filter(t => t.paymentMethod === 'card').reduce((sum, t) => sum + t.total, 0),
    digital: todayTransactions.filter(t => t.paymentMethod === 'digital').reduce((sum, t) => sum + t.total, 0),
  };

  return (
    <div className="page-container bg-background">
      <PageHeader title="Reports" />

      <main className="px-4 space-y-4 pb-4">
        {/* Date Header */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>

        {/* Shift Status */}
        {currentShift && (
          <div className="bg-card rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${currentShift.isOpen ? 'bg-success animate-pulse' : 'bg-muted'}`} />
              <span className="font-semibold text-foreground">
                Shift {currentShift.isOpen ? 'Active' : 'Closed'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Opened at</p>
                <p className="font-semibold text-foreground">
                  {currentShift.openedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {currentShift.closedAt && (
                <div>
                  <p className="text-muted-foreground">Closed at</p>
                  <p className="font-semibold text-foreground">
                    {currentShift.closedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Opening Cash</p>
                <p className="font-semibold text-foreground">${currentShift.openingCash.toFixed(2)}</p>
              </div>
              {currentShift.closingCash !== undefined && (
                <div>
                  <p className="text-muted-foreground">Closing Cash</p>
                  <p className="font-semibold text-foreground">${currentShift.closingCash.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold text-foreground">${totalSales.toFixed(2)}</p>
          </div>

          <div className="bg-card rounded-2xl p-4">
            <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center mb-3">
              <ShoppingBag className="w-5 h-5 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">Transactions</p>
            <p className="text-2xl font-bold text-foreground">{todayTransactions.length}</p>
          </div>

          <div className="bg-card rounded-2xl p-4">
            <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-warning" />
            </div>
            <p className="text-sm text-muted-foreground">Avg. Sale</p>
            <p className="text-2xl font-bold text-foreground">${avgTransaction.toFixed(2)}</p>
          </div>

          <div className="bg-card rounded-2xl p-4">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground">Items Sold</p>
            <p className="text-2xl font-bold text-foreground">{totalItems}</p>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-card rounded-2xl p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">💵</span>
                <span className="text-foreground">Cash</span>
              </div>
              <span className="font-semibold text-foreground">${paymentBreakdown.cash.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">💳</span>
                <span className="text-foreground">Card</span>
              </div>
              <span className="font-semibold text-foreground">${paymentBreakdown.card.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">📱</span>
                <span className="text-foreground">Digital</span>
              </div>
              <span className="font-semibold text-foreground">${paymentBreakdown.digital.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card rounded-2xl p-4">
          <h3 className="font-semibold text-foreground mb-4">Recent Transactions</h3>
          {todayTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {todayTransactions.slice(-5).reverse().map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-foreground">
                      {transaction.items.length} {transaction.items.length === 1 ? 'item' : 'items'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' • '}
                      <span className="capitalize">{transaction.paymentMethod}</span>
                    </p>
                  </div>
                  <span className="font-semibold text-primary">${transaction.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <GlassNavigation />
    </div>
  );
};

export default Reports;
