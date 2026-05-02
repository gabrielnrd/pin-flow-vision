import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinanceProvider } from "@/stores/financeStore";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

import { ThemeProvider } from "@/hooks/use-theme";
import { AppNav } from "@/components/AppNav";
import { MobileNav } from "@/components/MobileNav";
import Index from "./pages/Index";
import GoalsPage from "./pages/Goals";
import RendaPage from "./pages/Renda";
import TransportePage from "./pages/Transporte";
import TradePage from "./pages/Trade";
import DividaPage from "./pages/Divida";
import CarteiraPage from "./pages/Carteira";
import LifeGamePage from "./pages/LifeGame";
import AuthPage from "./pages/Auth";
import ResetPasswordPage from "./pages/ResetPassword";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<AuthPage />} />
        </Routes>
        <Toaster />
        <Sonner />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <AppNav />
      <MobileNav />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/objetivos" element={<GoalsPage />} />
        <Route path="/renda" element={<RendaPage />} />
        <Route path="/transporte" element={<TransportePage />} />
        <Route path="/trade" element={<TradePage />} />
        <Route path="/divida" element={<DividaPage />} />
        <Route path="/carteira" element={<CarteiraPage />} />
        <Route path="/lifegame" element={<LifeGamePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <Sonner />
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <FinanceProvider>
            <AppRoutes />
          </FinanceProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
