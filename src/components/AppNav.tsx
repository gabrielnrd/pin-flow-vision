import { NavLink } from "react-router-dom";
import { LayoutDashboard, Target, DollarSign, Car, Sun, Moon, TrendingUp, TrendingDown, Gamepad2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/useAuth";

export function AppNav() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 h-12">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )
          }
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </NavLink>
        <NavLink
          to="/objetivos"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )
          }
        >
          <Target className="w-4 h-4" />
          Objetivos
        </NavLink>
        <NavLink
          to="/renda"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )
          }
        >
          <DollarSign className="w-4 h-4" />
          Renda
        </NavLink>
        <NavLink
          to="/transporte"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )
          }
        >
          <Car className="w-4 h-4" />
          Transporte
        </NavLink>
        <NavLink
          to="/divida"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )
          }
        >
          <TrendingDown className="w-4 h-4" />
          Dívida
        </NavLink>
        <NavLink
          to="/trade"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )
          }
        >
          <TrendingUp className="w-4 h-4" />
          Trade
        </NavLink>
        <NavLink
          to="/lifegame"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )
          }
        >
          <Gamepad2 className="w-4 h-4" />
          LifeGame
        </NavLink>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="ml-auto p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-300 group"
          title={theme === "dark" ? "Modo claro" : "Modo escuro"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-12" />
          )}
        </button>
      </div>
    </nav>
  );
}
