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
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-background/85 border-b border-border hidden md:block">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 h-14">
        <NavLink to="/" end className={({ isActive }) => cn("flex items-center gap-1.5 px-2.5 h-full font-mono text-[11px] uppercase tracking-[0.14em] border-b-2 transition-colors", isActive ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
        </NavLink>
        <NavLink to="/objetivos" className={({ isActive }) => cn("flex items-center gap-1.5 px-2.5 h-full font-mono text-[11px] uppercase tracking-[0.14em] border-b-2 transition-colors", isActive ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <Target className="w-3.5 h-3.5" /> Objetivos
        </NavLink>
        <NavLink to="/renda" className={({ isActive }) => cn("flex items-center gap-1.5 px-2.5 h-full font-mono text-[11px] uppercase tracking-[0.14em] border-b-2 transition-colors", isActive ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <DollarSign className="w-3.5 h-3.5" /> Renda
        </NavLink>
        <NavLink to="/divida" className={({ isActive }) => cn("flex items-center gap-1.5 px-2.5 h-full font-mono text-[11px] uppercase tracking-[0.14em] border-b-2 transition-colors", isActive ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <TrendingDown className="w-3.5 h-3.5" /> Dívida
        </NavLink>
        <NavLink to="/trade" className={({ isActive }) => cn("flex items-center gap-1.5 px-2.5 h-full font-mono text-[11px] uppercase tracking-[0.14em] border-b-2 transition-colors", isActive ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <TrendingUp className="w-3.5 h-3.5" /> Trade
        </NavLink>
        <NavLink to="/carteira" className={({ isActive }) => cn("flex items-center gap-1.5 px-2.5 h-full font-mono text-[11px] uppercase tracking-[0.14em] border-b-2 transition-colors", isActive ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <Wallet className="w-3.5 h-3.5" /> Carteira
        </NavLink>
        <NavLink to="/lifegame" className={({ isActive }) => cn("flex items-center gap-1.5 px-2.5 h-full font-mono text-[11px] uppercase tracking-[0.14em] border-b-2 transition-colors", isActive ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <Gamepad2 className="w-3.5 h-3.5" /> LifeGame
        </NavLink>
        <NavLink to="/desejos" className={({ isActive }) => cn("flex items-center gap-1.5 px-2.5 h-full font-mono text-[11px] uppercase tracking-[0.14em] border-b-2 transition-colors", isActive ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <Sparkles className="w-3.5 h-3.5" /> Desejos
        </NavLink>


        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground border border-transparent hover:border-border transition-all duration-300 group"
            title={THEME_LABELS[theme]}
          >
            <ThemeIcon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
          </button>
        </div>
      </div>
    </nav>
  );
}
