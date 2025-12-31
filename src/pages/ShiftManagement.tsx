import React, { useState } from 'react';
import { Play, Square, DollarSign, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePOS } from '@/context/POSContext';
import { useToast } from '@/hooks/use-toast';

const ShiftManagement: React.FC = () => {
  const [openingCash, setOpeningCash] = useState('');
  const [closingCash, setClosingCash] = useState('');
  const { currentShift, openShift, closeShift, currentUser, logout } = usePOS();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(openingCash) || 0;
    openShift(amount);
    toast({
      title: 'Shift opened!',
      description: `Starting cash: $${amount.toFixed(2)}`,
    });
    navigate('/pos');
  };

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(closingCash) || 0;
    closeShift(amount);
    toast({
      title: 'Shift closed!',
      description: 'You can now view reports.',
    });
    navigate('/reports');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const totalSales = currentShift?.transactions.reduce((sum, t) => sum + t.total, 0) || 0;
  const transactionCount = currentShift?.transactions.length || 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-sm mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Shift Management</h1>
            <p className="text-muted-foreground">Welcome, {currentUser}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Current Shift Status */}
        {currentShift && (
          <div className="bg-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${currentShift.isOpen ? 'bg-success animate-pulse' : 'bg-muted'}`} />
              <span className="font-semibold text-foreground">
                Shift {currentShift.isOpen ? 'Active' : 'Closed'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary rounded-2xl p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">Started</span>
                </div>
                <p className="font-semibold text-foreground">
                  {currentShift.openedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="bg-secondary rounded-2xl p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs">Sales</span>
                </div>
                <p className="font-semibold text-foreground">${totalSales.toFixed(2)}</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              {transactionCount} transactions completed
            </p>
          </div>
        )}

        {/* Open Shift Form */}
        {!currentShift && (
          <form onSubmit={handleOpenShift} className="bg-card rounded-3xl p-6 space-y-4">
            <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto">
              <Play className="w-8 h-8 text-success" />
            </div>
            
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">Open New Shift</h2>
              <p className="text-sm text-muted-foreground">Enter opening cash amount</p>
            </div>

            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="number"
                value={openingCash}
                onChange={(e) => setOpeningCash(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full h-14 pl-12 pr-4 bg-secondary border-0 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg font-semibold"
              />
            </div>

            <button
              type="submit"
              className="w-full h-14 bg-success text-success-foreground font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Open Shift
            </button>
          </form>
        )}

        {/* Close Shift Form */}
        {currentShift?.isOpen && (
          <form onSubmit={handleCloseShift} className="bg-card rounded-3xl p-6 space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto">
              <Square className="w-8 h-8 text-destructive" />
            </div>
            
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">Close Shift</h2>
              <p className="text-sm text-muted-foreground">Enter closing cash amount</p>
            </div>

            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="number"
                value={closingCash}
                onChange={(e) => setClosingCash(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full h-14 pl-12 pr-4 bg-secondary border-0 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg font-semibold"
              />
            </div>

            <button
              type="submit"
              className="w-full h-14 bg-destructive text-destructive-foreground font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Square className="w-5 h-5" />
              Close Shift
            </button>
          </form>
        )}

        {/* Continue to POS */}
        {currentShift?.isOpen && (
          <button
            onClick={() => navigate('/pos')}
            className="w-full h-14 bg-foreground text-background font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Continue to POS
          </button>
        )}

        {/* View Reports (when closed) */}
        {currentShift && !currentShift.isOpen && (
          <button
            onClick={() => navigate('/reports')}
            className="w-full h-14 bg-foreground text-background font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all"
          >
            View Reports
          </button>
        )}
      </div>
    </div>
  );
};

export default ShiftManagement;
