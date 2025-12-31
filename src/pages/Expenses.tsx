import React, { useState, useMemo } from 'react';
import { Plus, DollarSign, MinusCircle, Trash2, TrendingDown, Calendar } from 'lucide-react';
import { format, startOfDay, subDays } from 'date-fns';
import { PageHeader } from '@/components/PageHeader';
import { GlassNavigation } from '@/components/GlassNavigation';
import { usePOS } from '@/context/POSContext';
import { useToast } from '@/hooks/use-toast';

const Expenses: React.FC = () => {
  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  
  const { expenses, addExpense, removeExpense } = usePOS();
  const { toast } = useToast();

  // Calculate today's expenses total
  const todayExpenses = useMemo(() => {
    const today = startOfDay(new Date());
    return expenses.filter(e => startOfDay(new Date(e.date)).getTime() === today.getTime());
  }, [expenses]);

  const todayExpensesTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group expenses by date
  const expensesByDate = useMemo(() => {
    const grouped: { [key: string]: typeof expenses } = {};
    expenses.forEach(expense => {
      const dateKey = format(new Date(expense.date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(expense);
    });
    return grouped;
  }, [expenses]);

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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddExpense();
    }
  };

  return (
    <div className="page-container bg-background">
      <PageHeader title="Expenses" showBack />

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

        {/* Today's Expenses List */}
        {todayExpenses.length > 0 && (
          <div className="bg-card rounded-3xl p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Today's Expenses
            </h3>
            <div className="space-y-2">
              {todayExpenses.map(expense => (
                <div key={expense.id} className="bg-secondary/50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(expense.date), 'h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-destructive">-${expense.amount.toFixed(2)}</span>
                    <button
                      onClick={() => handleRemoveExpense(expense.id)}
                      className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Previous Expenses */}
        {Object.keys(expensesByDate).filter(date => date !== format(new Date(), 'yyyy-MM-dd')).length > 0 && (
          <div className="bg-card rounded-3xl p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <MinusCircle className="w-5 h-5 text-muted-foreground" />
              Previous Expenses
            </h3>
            <div className="space-y-4">
              {Object.entries(expensesByDate)
                .filter(([date]) => date !== format(new Date(), 'yyyy-MM-dd'))
                .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                .slice(0, 5)
                .map(([date, dayExpenses]) => (
                  <div key={date}>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">
                      {format(new Date(date), 'EEEE, MMMM d')}
                    </p>
                    <div className="space-y-2">
                      {dayExpenses.map(expense => (
                        <div key={expense.id} className="bg-secondary/30 rounded-xl p-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground text-sm">{expense.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(expense.date), 'h:mm a')}
                            </p>
                          </div>
                          <span className="font-semibold text-destructive text-sm">-${expense.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {expenses.length === 0 && (
          <div className="bg-card rounded-3xl p-8 text-center">
            <MinusCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No expenses yet</h3>
            <p className="text-muted-foreground text-sm">
              Start tracking your business expenses by adding one above.
            </p>
          </div>
        )}
      </main>

      <GlassNavigation />
    </div>
  );
};

export default Expenses;
