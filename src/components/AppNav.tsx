import { NavLink } from "react-router-dom";
import { LayoutDashboard, Target, DollarSign, Sun, Moon, Contrast, TrendingUp, TrendingDown, Gamepad2, Wallet, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

const THEME_LABELS: Record<string, string> = {
  dark: "Modo escuro",
  light: "Modo claro",
  monochrome: "Monocromático P&B",
};

export function AppNav() {
  const { theme, toggleTheme } = useTheme();

  const ThemeIcon = theme === "dark" ? Sun : theme === "light" ? Moon : Contrast;

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50 hidden md:block">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 h-12">
        <NavLink to="/" end className={({ isActive }) => cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>
          <LayoutDashboard className="w-4 h-4" /> Dashboard
        </NavLink>
        <NavLink to="/objetivos" className={({ isActive }) => cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>
          <Target className="w-4 h-4" /> Objetivos
        </NavLink>
        <NavLink to="/renda" className={({ isActive }) => cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>
          <DollarSign className="w-4 h-4" /> Renda
        </NavLink>
        <NavLink to="/divida" className={({ isActive }) => cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>
          <TrendingDown className="w-4 h-4" /> Dívida
        </NavLink>
        <NavLink to="/trade" className={({ isActive }) => cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>
          <TrendingUp className="w-4 h-4" /> Trade
        </NavLink>
        <NavLink to="/carteira" className={({ isActive }) => cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>
          <Wallet className="w-4 h-4" /> Carteira
        </NavLink>
        <NavLink to="/lifegame" className={({ isActive }) => cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>
          <Gamepad2 className="w-4 h-4" /> LifeGame
        </NavLink>
        <NavLink to="/desejos" className={({ isActive }) => cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>
          <Sparkles className="w-4 h-4" /> Desejos
        </NavLink>


        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-300 group"
            title={THEME_LABELS[theme]}
          >
            <ThemeIcon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
          </button>
        </div>
      </div>
    </nav>
  );
}
