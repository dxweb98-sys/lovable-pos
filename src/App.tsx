import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { POSProvider, usePOS } from "@/context/POSContext";
import Login from "./pages/Login";
import ShiftManagement from "./pages/ShiftManagement";
import POS from "./pages/POS";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = usePOS();
  
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Shift Required Route Component
const ShiftRequiredRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, currentShift } = usePOS();
  
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  
  if (!currentShift) {
    return <Navigate to="/shift" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route 
        path="/shift" 
        element={
          <ProtectedRoute>
            <ShiftManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/pos" 
        element={
          <ShiftRequiredRoute>
            <POS />
          </ShiftRequiredRoute>
        } 
      />
      <Route 
        path="/cart" 
        element={
          <ShiftRequiredRoute>
            <Cart />
          </ShiftRequiredRoute>
        } 
      />
      <Route 
        path="/checkout" 
        element={
          <ShiftRequiredRoute>
            <Checkout />
          </ShiftRequiredRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ShiftRequiredRoute>
            <Dashboard />
          </ShiftRequiredRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <ShiftRequiredRoute>
            <Reports />
          </ShiftRequiredRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <POSProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </POSProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
