import React, { useState, useMemo } from 'react';
import { Calendar, DollarSign, ShoppingBag, TrendingUp, Clock, CreditCard, Download, Crown, CalendarDays, CalendarRange, Eye, FileText, Package, ChevronRight, Lock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { PageHeader } from '@/components/PageHeader';
import { GlassNavigation } from '@/components/GlassNavigation';
import { FeatureGate, PlanBadge } from '@/components/FeatureGate';
import { usePOS, Transaction, CartItem } from '@/context/POSContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';

const Reports: React.FC = () => {
  const { currentShift, transactions } = usePOS();
  const { hasFeature, features, currentPlan } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [period, setPeriod] = useState<ReportPeriod>('daily');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(subDays(new Date(), 7));
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(new Date());

  // Free users can only see last 7 days
  const isFreeUser = currentPlan === 'free';
  const maxHistoryDays = isFreeUser ? 7 : 365;

  const getFilteredTransactions = () => {
    const now = new Date();
    const today = startOfDay(now);
    const maxHistoryDate = subDays(today, maxHistoryDays);
    
    return transactions.filter(t => {
      const transactionDate = new Date(t.timestamp);
      
      // Apply free user restriction first
      if (transactionDate < maxHistoryDate) {
        return false;
      }
      
      switch (period) {
        case 'daily':
          return transactionDate >= today;
        case 'weekly':
          return transactionDate >= subDays(today, 7);
        case 'monthly':
          return isWithinInterval(transactionDate, {
            start: startOfMonth(now),
            end: endOfMonth(now),
          });
        case 'custom':
          if (customStartDate && customEndDate) {
            return isWithinInterval(transactionDate, {
              start: startOfDay(customStartDate),
              end: endOfDay(customEndDate),
            });
          }
          return true;
        default:
          return true;
      }
    });
  };

  const filteredTransactions = getFilteredTransactions();
  const totalSales = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalItems = filteredTransactions.reduce((sum, t) => 
    sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );
  const avgTransaction = filteredTransactions.length > 0 ? totalSales / filteredTransactions.length : 0;
  
  // Calculate best-selling products
  const bestSellingProducts = useMemo(() => {
    const productMap = new Map<string, { name: string; quantity: number; revenue: number; image: string }>();
    
    filteredTransactions.forEach(t => {
      t.items.forEach((item: CartItem) => {
        const existing = productMap.get(item.id);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.price * item.quantity;
        } else {
          productMap.set(item.id, {
            name: item.name,
            quantity: item.quantity,
            revenue: item.price * item.quantity,
            image: item.image,
          });
        }
      });
    });
    
    return Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [filteredTransactions]);

  // Estimate profit (simple: 30% margin assumption for demo)
  const estimatedProfit = totalSales * 0.3;

  const paymentBreakdown = {
    cash: filteredTransactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.total, 0),
    card: filteredTransactions.filter(t => t.paymentMethod === 'card').reduce((sum, t) => sum + t.total, 0),
    digital: filteredTransactions.filter(t => ['digital', 'qris'].includes(t.paymentMethod)).reduce((sum, t) => sum + t.total, 0),
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'daily':
        return format(new Date(), 'EEE, MMM d');
      case 'weekly':
        return `${format(subDays(new Date(), 7), 'MMM d')} - ${format(new Date(), 'MMM d')}`;
      case 'monthly':
        return format(new Date(), 'MMMM yyyy');
      case 'custom':
        if (customStartDate && customEndDate) {
          return `${format(customStartDate, 'MMM d')} - ${format(customEndDate, 'MMM d')}`;
        }
        return 'Custom Range';
    }
  };

  const handleExportReport = () => {
    if (!hasFeature('reportExport')) {
      toast({
        title: 'Feature locked',
        description: 'Upgrade to Pro to export reports.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Report exported!',
      description: `${period.charAt(0).toUpperCase() + period.slice(1)} report has been downloaded.`,
    });
  };

  const handlePeriodChange = (newPeriod: ReportPeriod) => {
    if (newPeriod !== 'daily' && currentPlan === 'free') {
      toast({
        title: 'Feature locked',
        description: 'Upgrade to Basic or higher for advanced reports.',
        variant: 'destructive',
      });
      return;
    }
    
    if (newPeriod === 'custom') {
      setShowDatePicker(true);
    } else {
      setPeriod(newPeriod);
    }
  };

  const handleDateRangeConfirm = () => {
    if (customStartDate && customEndDate) {
      setPeriod('custom');
      setShowDatePicker(false);
    }
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetail(true);
  };

  const handleExportTransactions = () => {
    if (!hasFeature('reportExport')) {
      toast({
        title: 'Feature locked',
        description: 'Upgrade to Pro to export transaction history.',
        variant: 'destructive',
      });
      navigate('/subscription');
      return;
    }
    
    // Generate CSV content
    const csvContent = [
      'ID,Date,Time,Items,Subtotal,Discount,Tax,Total,Payment Method,Customer',
      ...filteredTransactions.map(t => 
        `${t.id},${format(new Date(t.timestamp), 'yyyy-MM-dd')},${format(new Date(t.timestamp), 'HH:mm')},${t.items.length},${t.subtotal},${t.discount},${t.tax},${t.total},${t.paymentMethod},${t.customer?.name || 'Walk-in'}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export successful!',
      description: `${filteredTransactions.length} transactions exported.`,
    });
  };

  const canAccessAdvancedReports = currentPlan !== 'free';

  return (
    <div className="page-container bg-background">
      <PageHeader 
        title="Reports" 
        rightContent={
          <button
            onClick={() => navigate('/subscription')}
            className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
          >
            <Crown className="w-5 h-5 text-primary" />
          </button>
        }
      />

      <main className="px-4 space-y-4 pb-4">
        {/* Period Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => handlePeriodChange('daily')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              period === 'daily' 
                ? 'bg-foreground text-background' 
                : 'bg-secondary text-foreground'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Daily
          </button>
          <button
            onClick={() => handlePeriodChange('weekly')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              period === 'weekly' 
                ? 'bg-foreground text-background' 
                : canAccessAdvancedReports 
                  ? 'bg-secondary text-foreground' 
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Weekly
            {!canAccessAdvancedReports && <Crown className="w-3 h-3" />}
          </button>
          <button
            onClick={() => handlePeriodChange('monthly')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              period === 'monthly' 
                ? 'bg-foreground text-background' 
                : canAccessAdvancedReports 
                  ? 'bg-secondary text-foreground' 
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Monthly
            {!canAccessAdvancedReports && <Crown className="w-3 h-3" />}
          </button>
          <button
            onClick={() => handlePeriodChange('custom')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              period === 'custom' 
                ? 'bg-foreground text-background' 
                : canAccessAdvancedReports 
                  ? 'bg-secondary text-foreground' 
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            Custom
            {!canAccessAdvancedReports && <Crown className="w-3 h-3" />}
          </button>
        </div>

        {/* Date Header with Plan Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">{getPeriodLabel()}</span>
          </div>
          <PlanBadge />
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
            <p className="text-2xl font-bold text-foreground">{filteredTransactions.length}</p>
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
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Items Sold</p>
            <p className="text-2xl font-bold text-foreground">{totalItems}</p>
          </div>
        </div>

        {/* Profit Card */}
        <div className="bg-gradient-to-r from-success/20 to-success/5 rounded-2xl p-4 border border-success/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Profit</p>
                <p className="text-2xl font-bold text-success">${estimatedProfit.toFixed(2)}</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-lg">~30% margin</span>
          </div>
        </div>

        {/* Best Selling Products */}
        {bestSellingProducts.length > 0 && (
          <div className="bg-card rounded-2xl p-4">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-warning" />
              Best Selling Products
            </h3>
            <div className="space-y-3">
              {bestSellingProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.quantity} sold</p>
                    </div>
                  </div>
                  <span className="font-semibold text-primary text-sm">${product.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export Report - Feature Gated */}
        <FeatureGate feature="reportExport">
          <button
            onClick={handleExportReport}
            className="w-full h-12 bg-primary text-primary-foreground font-medium rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </FeatureGate>

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
                <span className="text-foreground">Digital/QRIS</span>
              </div>
              <span className="font-semibold text-foreground">${paymentBreakdown.digital.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Free Plan Restriction Notice */}
        {isFreeUser && (
          <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground text-sm">Limited History Access</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Free plan can only view last 7 days of transactions. Upgrade to see full history and export data.
                </p>
                <button
                  onClick={() => navigate('/subscription')}
                  className="mt-2 text-xs font-medium text-primary hover:underline flex items-center gap-1"
                >
                  Upgrade Plan <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Transaction History
            </h3>
            <div className="flex items-center gap-2">
              {!isFreeUser && (
                <button
                  onClick={handleExportTransactions}
                  className="text-xs px-3 py-1.5 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Export CSV
                </button>
              )}
              {isFreeUser && (
                <button
                  onClick={() => navigate('/subscription')}
                  className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  Unlock Export
                </button>
              )}
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No transactions yet</p>
          ) : (
            <>
              <div className="space-y-2">
                {filteredTransactions.slice(0, showAllTransactions ? undefined : 5).reverse().map(transaction => (
                  <button
                    key={transaction.id}
                    onClick={() => handleViewTransaction(transaction)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {transaction.items.length} {transaction.items.length === 1 ? 'item' : 'items'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.timestamp), 'MMM d, HH:mm')}
                          {' • '}
                          <span className="capitalize">{transaction.paymentMethod}</span>
                          {transaction.customer && ` • ${transaction.customer.name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary">${transaction.total.toFixed(2)}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>

              {filteredTransactions.length > 5 && (
                <button
                  onClick={() => setShowAllTransactions(!showAllTransactions)}
                  className="w-full mt-3 py-2 text-sm font-medium text-primary hover:underline"
                >
                  {showAllTransactions ? 'Show Less' : `View All ${filteredTransactions.length} Transactions`}
                </button>
              )}
            </>
          )}
        </div>
      </main>

      {/* Transaction Detail Drawer */}
      <Drawer open={showTransactionDetail} onOpenChange={setShowTransactionDetail}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b border-border pb-4">
            <DrawerTitle className="text-center">Transaction Details</DrawerTitle>
          </DrawerHeader>
          
          {selectedTransaction && (
            <ScrollArea className="p-4 max-h-[60vh]">
              <div className="space-y-4">
                {/* Transaction Info */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span className="font-mono text-foreground text-xs">{selectedTransaction.id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Date & Time</span>
                    <span className="text-foreground">
                      {format(new Date(selectedTransaction.timestamp), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="capitalize text-foreground">{selectedTransaction.paymentMethod}</span>
                  </div>
                  {selectedTransaction.customer && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Customer</span>
                      <span className="text-foreground">{selectedTransaction.customer.name}</span>
                    </div>
                  )}
                </div>

                {/* Items Table */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Items</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTransaction.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Totals */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${selectedTransaction.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedTransaction.discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-destructive">-${selectedTransaction.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedTransaction.tax > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="text-foreground">${selectedTransaction.tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="h-px bg-border my-2" />
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary text-lg">${selectedTransaction.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {hasFeature('receiptExport') ? (
                    <button
                      onClick={() => {
                        toast({
                          title: 'Receipt printed!',
                          description: 'Receipt has been sent to printer.',
                        });
                      }}
                      className="flex-1 h-12 bg-secondary text-foreground font-medium rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      <FileText className="w-5 h-5" />
                      Print Receipt
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/subscription')}
                      className="flex-1 h-12 bg-muted text-muted-foreground font-medium rounded-xl hover:bg-muted/80 transition-all flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Print (Upgrade)
                    </button>
                  )}
                  <DrawerClose asChild>
                    <button className="flex-1 h-12 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-all">
                      Close
                    </button>
                  </DrawerClose>
                </div>
              </div>
            </ScrollArea>
          )}
        </DrawerContent>
      </Drawer>

      {/* Date Range Picker Drawer */}
      <Drawer open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b border-border pb-4">
            <DrawerTitle className="text-center">Select Date Range</DrawerTitle>
          </DrawerHeader>
          
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Start Date</label>
              <div className="flex justify-center">
                <CalendarComponent
                  mode="single"
                  selected={customStartDate}
                  onSelect={setCustomStartDate}
                  className="rounded-xl border border-border"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">End Date</label>
              <div className="flex justify-center">
                <CalendarComponent
                  mode="single"
                  selected={customEndDate}
                  onSelect={setCustomEndDate}
                  disabled={(date) => customStartDate ? date < customStartDate : false}
                  className="rounded-xl border border-border"
                />
              </div>
            </div>
            
            <button
              onClick={handleDateRangeConfirm}
              disabled={!customStartDate || !customEndDate}
              className="w-full h-12 bg-primary text-primary-foreground font-medium rounded-2xl hover:opacity-90 transition-all disabled:opacity-50"
            >
              Apply Range
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      <GlassNavigation />
    </div>
  );
};

export default Reports;
