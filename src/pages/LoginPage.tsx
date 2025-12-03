import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { Mail, Lock, LogIn, LogOut, User } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn, userData } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsLoggedIn(true);
      toast.success("Login realizado com sucesso!");
      setIsLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    toast.success("Logout realizado");
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-lg border-b border-border z-40 px-6 py-4">
          <h1 className="font-bold text-lg text-center">Perfil</h1>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Profile Card */}
          <Card variant="neon" className="p-6 text-center">
            <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-1">Usuário LowMax</h2>
            <p className="text-sm text-muted-foreground">{email || "usuario@email.com"}</p>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {userData.scores?.overall || "-"}
              </p>
              <p className="text-xs text-muted-foreground">Nota Geral</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-accent">
                {Object.keys(userData.checkins).length}
              </p>
              <p className="text-xs text-muted-foreground">Check-ins</p>
            </Card>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="neonOutline"
              className="w-full"
              onClick={() => navigate("/analysis")}
            >
              Ver Minha Análise
            </Button>
            <Button
              variant="outline"
              className="w-full text-destructive border-destructive/50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Sair da conta
            </Button>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      {/* Header */}
      <div className="px-6 py-8">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 px-6">
        <Card variant="glass" className="p-6">
          <h2 className="text-xl font-bold text-center mb-6">Entrar na sua conta</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10 bg-secondary border-border"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-secondary border-border"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="neon"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Entrando...
                </div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Não tem conta?{" "}
            <button className="text-primary font-medium">Criar conta</button>
          </p>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
