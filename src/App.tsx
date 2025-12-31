import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { POSProvider } from "@/context/POSContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Auth from "./pages/Auth";
import POS from "./pages/POS";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Subscription from "./pages/Subscription";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Auth Protected Route Component
const AuthProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Auth Page Route - Redirect if already logged in
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/pos" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <AuthRoute>
          <Auth />
        </AuthRoute>
      } />
      <Route 
        path="/pos" 
        element={
          <AuthProtectedRoute>
            <POS />
          </AuthProtectedRoute>
        } 
      />
      <Route 
        path="/cart" 
        element={
          <AuthProtectedRoute>
            <Cart />
          </AuthProtectedRoute>
        } 
      />
      <Route 
        path="/checkout" 
        element={
          <AuthProtectedRoute>
            <Checkout />
          </AuthProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <AuthProtectedRoute>
            <Dashboard />
          </AuthProtectedRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <AuthProtectedRoute>
            <Reports />
          </AuthProtectedRoute>
        } 
      />
      <Route 
        path="/subscription" 
        element={
          <AuthProtectedRoute>
            <Subscription />
          </AuthProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <AuthProtectedRoute>
            <Settings />
          </AuthProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <AuthProtectedRoute>
            <Profile />
          </AuthProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <POSProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </POSProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
