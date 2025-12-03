import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/context/AppContext";
import heroImage from "@/assets/hero-image.jpg";
import { ArrowRight, Sparkles, Target, TrendingUp } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const { userData } = useApp();

  const features = [
    { icon: Target, label: "Análise Facial", desc: "IA analisa seu rosto" },
    { icon: Sparkles, label: "Recomendações", desc: "Dicas personalizadas" },
    { icon: TrendingUp, label: "Evolução", desc: "Acompanhe seu progresso" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background z-10" />
        <img
          src={heroImage}
          alt="LowMax - Análise Facial"
          className="w-full h-[50vh] object-cover"
        />
        
        {/* Logo Overlay */}
        <div className="absolute top-6 left-6 z-20">
          <Logo size="md" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 px-6 -mt-20">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl font-extrabold leading-tight">
            Seu guia de{" "}
            <span className="text-primary drop-shadow-[0_0_20px_hsl(200,100%,50%/0.8)]">
              evolução facial
            </span>{" "}
            e aparência
          </h1>
          <p className="text-muted-foreground text-base">
            Descubra seu potencial e transforme sua aparência com análise inteligente e dicas personalizadas.
          </p>
        </div>

        {/* CTA Button */}
        <Button
          variant="neon"
          size="xl"
          className="w-full mb-8"
          onClick={() => navigate(userData.scores ? "/analysis" : "/onboarding")}
        >
          {userData.scores ? "Ver Minha Análise" : "Começar"}
          <ArrowRight className="w-5 h-5" />
        </Button>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {features.map((feature) => (
            <div
              key={feature.label}
              className="bg-card border border-border rounded-2xl p-4 text-center space-y-2"
            >
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xs font-semibold">{feature.label}</h3>
              <p className="text-[10px] text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Quick Stats if user has data */}
        {userData.scores && (
          <div className="bg-card border border-primary/30 rounded-2xl p-5 shadow-[0_0_20px_hsl(200,100%,50%/0.2)]">
            <h3 className="text-sm font-semibold mb-4 text-muted-foreground">Sua Pontuação</h3>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{userData.scores.overall}</p>
                <p className="text-xs text-muted-foreground">Geral</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">{userData.scores.potential}</p>
                <p className="text-xs text-muted-foreground">Potencial</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
