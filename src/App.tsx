import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FinanceProvider } from "@/stores/financeStore";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppNav } from "@/components/AppNav";
import Index from "./pages/Index";
import GoalsPage from "./pages/Goals";
import RendaPage from "./pages/Renda";
import TransportePage from "./pages/Transporte";
import TradePage from "./pages/Trade";
import DividaPage from "./pages/Divida";
import LifeGamePage from "./pages/LifeGame";
import AuthPage from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <FinanceProvider>
      <AppNav />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/objetivos" element={<GoalsPage />} />
        <Route path="/renda" element={<RendaPage />} />
        <Route path="/transporte" element={<TransportePage />} />
        <Route path="/trade" element={<TradePage />} />
        <Route path="/divida" element={<DividaPage />} />
        <Route path="/lifegame" element={<LifeGamePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </FinanceProvider>
  );
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;
  return <AuthPage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthRoute />} />
              <Route path="/*" element={<ProtectedRoutes />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
