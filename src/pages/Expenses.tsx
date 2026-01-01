import React, { useState, useMemo } from 'react';
import { Plus, DollarSign, MinusCircle, Trash2, TrendingDown, Calendar, Crown, Lock, Eye, Download, ChevronRight } from 'lucide-react';
import { format, startOfDay, subDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { GlassNavigation } from '@/components/GlassNavigation';
import { usePOS, Expense } from '@/context/POSContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';

const Expenses: React.FC = () => {
  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showExpenseDetail, setShowExpenseDetail] = useState(false);
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  
  const { expenses, addExpense, removeExpense } = usePOS();
  const { currentPlan, hasFeature } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Plan-based restrictions
  const isFreeUser = currentPlan === 'free';
  const maxHistoryDays = isFreeUser ? 7 : 365;

  // Filter expenses based on plan restrictions
  const accessibleExpenses = useMemo(() => {
    const maxHistoryDate = subDays(startOfDay(new Date()), maxHistoryDays);
    return expenses.filter(e => new Date(e.date) >= maxHistoryDate);
  }, [expenses, maxHistoryDays]);

  // Calculate today's expenses
  const todayExpenses = useMemo(() => {
    const today = startOfDay(new Date());
    return accessibleExpenses.filter(e => startOfDay(new Date(e.date)).getTime() === today.getTime());
  }, [accessibleExpenses]);

  const todayExpensesTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalAccessibleExpenses = accessibleExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group expenses by date
  const expensesByDate = useMemo(() => {
    const grouped: { [key: string]: typeof expenses } = {};
    accessibleExpenses.forEach(expense => {
      const dateKey = format(new Date(expense.date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(expense);
    });
    return grouped;
  }, [accessibleExpenses]);

  const handleAddExpense = () => {
    const desc = newExpenseDesc.trim();
    const amount = parseFloat(newExpenseAmount);
    
    if (!desc) {
      toast({
        title: 'Description required',
        description: 'Please enter a description for the expense.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!newExpenseAmount || isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount greater than 0.',
        variant: 'destructive',
      });
      return;
    }
    
    addExpense({
      description: desc,
      amount: amount,
    });
    
    setNewExpenseDesc('');
    setNewExpenseAmount('');
    
    toast({
      title: 'Expense added',
      description: `$${amount.toFixed(2)} for ${desc}`,
    });
  };

  const handleRemoveExpense = (id: string) => {
    removeExpense(id);
    toast({
      title: 'Expense removed',
    });
    setShowExpenseDetail(false);
  };

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowExpenseDetail(true);
  };

  const handleExportExpenses = () => {
    if (!hasFeature('reportExport')) {
      toast({
        title: 'Feature locked',
        description: 'Upgrade to Pro to export expenses.',
        variant: 'destructive',
      });
      navigate('/subscription');
      return;
    }
    
    const csvContent = [
      'ID,Date,Time,Description,Amount',
      ...accessibleExpenses.map(e => 
        `${e.id},${format(new Date(e.date), 'yyyy-MM-dd')},${format(new Date(e.date), 'HH:mm')},${e.description},${e.amount.toFixed(2)}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export successful!',
      description: `${accessibleExpenses.length} expenses exported.`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddExpense();
    }
  };

  return (
    <div className="page-container bg-background">
      <PageHeader 
        title="Expenses" 
        showBack
        rightContent={
          <button 
            onClick={() => navigate('/subscription')}
            className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 active:scale-95 transition-all"
          >
            <Crown className="w-5 h-5 text-primary" />
          </button>
        }
      />

      <main className="px-4 space-y-4 pb-32">
        {/* Today's Summary Card */}
        <div className="bg-gradient-to-br from-destructive/20 to-destructive/5 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-destructive/20 rounded-2xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Expenses</p>
              <p className="text-3xl font-bold text-destructive">${todayExpensesTotal.toFixed(2)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {todayExpenses.length} expense{todayExpenses.length !== 1 ? 's' : ''} recorded today
          </p>
        </div>

        {/* Period Total Card */}
        <div className="bg-card rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isFreeUser ? 'Last 7 Days' : 'Total Period'} Expenses
                </p>
                <p className="text-xl font-bold text-foreground">${totalAccessibleExpenses.toFixed(2)}</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-lg">
              {accessibleExpenses.length} items
            </span>
          </div>
        </div>

        {/* Add Expense Form */}
        <div className="bg-card rounded-3xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add New Expense
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">What was it for?</label>
              <input
                type="text"
                value={newExpenseDesc}
                onChange={(e) => setNewExpenseDesc(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Office supplies, Utilities, Food..."
                className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">How much?</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full h-12 pl-10 pr-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            
            <button
              onClick={handleAddExpense}
              className="w-full h-14 bg-primary text-primary-foreground font-semibold rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Expense
            </button>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportExpenses}
          className={`w-full h-12 font-medium rounded-2xl transition-all flex items-center justify-center gap-2 ${
            hasFeature('reportExport') 
              ? 'bg-primary text-primary-foreground hover:opacity-90' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {hasFeature('reportExport') ? (
            <>
              <Download className="w-5 h-5" />
              Export Expenses
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Export Expenses
              <Crown className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Today's Expenses List */}
        {todayExpenses.length > 0 && (
          <div className="bg-card rounded-3xl p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Today's Expenses
            </h3>
            <div className="space-y-2">
              {todayExpenses.map(expense => (
                <button 
                  key={expense.id} 
                  onClick={() => handleViewExpense(expense)}
                  className="w-full bg-secondary/50 rounded-xl p-4 flex items-center justify-between hover:bg-secondary/70 transition-colors text-left"
                >
                  <div>
                    <p className="font-medium text-foreground">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(expense.date), 'h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-destructive">-${expense.amount.toFixed(2)}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Previous Expenses */}
        {Object.keys(expensesByDate).filter(date => date !== format(new Date(), 'yyyy-MM-dd')).length > 0 && (
          <div className="bg-card rounded-3xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <MinusCircle className="w-5 h-5 text-muted-foreground" />
                Previous Expenses
              </h3>
              <button
                onClick={() => setShowAllExpenses(true)}
                className="text-sm text-primary font-medium flex items-center gap-1"
              >
                View All
                <Eye className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {Object.entries(expensesByDate)
                .filter(([date]) => date !== format(new Date(), 'yyyy-MM-dd'))
                .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                .slice(0, 3)
                .map(([date, dayExpenses]) => (
                  <div key={date}>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">
                      {format(new Date(date), 'EEEE, MMMM d')}
                    </p>
                    <div className="space-y-2">
                      {dayExpenses.slice(0, 2).map(expense => (
                        <button 
                          key={expense.id} 
                          onClick={() => handleViewExpense(expense)}
                          className="w-full bg-secondary/30 rounded-xl p-3 flex items-center justify-between hover:bg-secondary/50 transition-colors text-left"
                        >
                          <div>
                            <p className="font-medium text-foreground text-sm">{expense.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(expense.date), 'h:mm a')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-destructive text-sm">-${expense.amount.toFixed(2)}</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Free Plan Restriction Notice */}
        {isFreeUser && (
          <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground text-sm">Limited History Access</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Free plan can only view last 7 days of expenses. Upgrade to see full history and export data.
                </p>
                <button
                  onClick={() => navigate('/subscription')}
                  className="mt-2 text-xs font-medium text-primary flex items-center gap-1"
                >
                  Upgrade Now <Crown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {accessibleExpenses.length === 0 && (
          <div className="bg-card rounded-3xl p-8 text-center">
            <MinusCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No expenses yet</h3>
            <p className="text-muted-foreground text-sm">
              Start tracking your business expenses by adding one above.
            </p>
          </div>
        )}
      </main>

      {/* Expense Detail Drawer */}
      <Drawer open={showExpenseDetail} onOpenChange={setShowExpenseDetail}>
        <DrawerContent>
          <DrawerHeader className="border-b border-border pb-4">
            <DrawerTitle>Expense Details</DrawerTitle>
          </DrawerHeader>
          {selectedExpense && (
            <div className="p-6 space-y-6">
              <div className="bg-destructive/10 rounded-2xl p-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                <p className="text-4xl font-bold text-destructive">-${selectedExpense.amount.toFixed(2)}</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Description</span>
                  <span className="font-medium text-foreground">{selectedExpense.description}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium text-foreground">
                    {format(new Date(selectedExpense.date), 'MMMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium text-foreground">
                    {format(new Date(selectedExpense.date), 'h:mm a')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-mono text-xs text-muted-foreground">{selectedExpense.id}</span>
                </div>
              </div>
              
              <button
                onClick={() => handleRemoveExpense(selectedExpense.id)}
                className="w-full h-12 bg-destructive text-destructive-foreground font-medium rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Delete Expense
              </button>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      {/* All Expenses Drawer */}
      <Drawer open={showAllExpenses} onOpenChange={setShowAllExpenses}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b border-border pb-4">
            <DrawerTitle>All Expenses ({accessibleExpenses.length})</DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="h-[60vh] px-4">
            <div className="py-4 space-y-4">
              {Object.entries(expensesByDate)
                .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                .map(([date, dayExpenses]) => {
                  const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
                  return (
                    <div key={date} className="bg-card rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-foreground">
                          {format(new Date(date), 'EEEE, MMM d')}
                        </p>
                        <span className="text-sm font-bold text-destructive">-${dayTotal.toFixed(2)}</span>
                      </div>
                      <div className="space-y-2">
                        {dayExpenses.map(expense => (
                          <button 
                            key={expense.id} 
                            onClick={() => {
                              setShowAllExpenses(false);
                              handleViewExpense(expense);
                            }}
                            className="w-full bg-secondary/50 rounded-xl p-3 flex items-center justify-between hover:bg-secondary/70 transition-colors text-left"
                          >
                            <div>
                              <p className="font-medium text-foreground text-sm">{expense.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(expense.date), 'h:mm a')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-destructive text-sm">-${expense.amount.toFixed(2)}</span>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>

      <GlassNavigation />
    </div>
  );
};

export default Expenses;