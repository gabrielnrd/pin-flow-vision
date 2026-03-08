import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinanceProvider } from "@/stores/financeStore";
import { ThemeProvider } from "@/hooks/use-theme";
import { AppNav } from "@/components/AppNav";
import Index from "./pages/Index";
import GoalsPage from "./pages/Goals";
import RendaPage from "./pages/Renda";
import TransportePage from "./pages/Transporte";
import TradePage from "./pages/Trade";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <FinanceProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppNav />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/objetivos" element={<GoalsPage />} />
              <Route path="/renda" element={<RendaPage />} />
              <Route path="/transporte" element={<TransportePage />} />
              <Route path="/trade" element={<TradePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </FinanceProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
