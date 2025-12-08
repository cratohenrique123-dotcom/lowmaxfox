import { Home, Camera, TrendingUp, CheckSquare, BookOpen, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Início", path: "/" },
  { icon: Camera, label: "Análise", path: "/analysis" },
  { icon: TrendingUp, label: "Evolução", path: "/evolution" },
  { icon: CheckSquare, label: "Check-in", path: "/checkin" },
  { icon: BookOpen, label: "Guias", path: "/guides" },
  { icon: User, label: "Perfil", path: "/login" },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-300 min-w-[50px] ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_8px_hsl(200,100%,50%)]" : ""}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
