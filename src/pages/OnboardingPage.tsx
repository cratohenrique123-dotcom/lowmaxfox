import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { useApp } from "@/context/AppContext";
import { Check, Sparkles, Smile, User, Zap } from "lucide-react";

const goals = [
  {
    id: "face",
    icon: Smile,
    title: "Melhorar rosto",
    desc: "Mandíbula, simetria, estrutura facial",
  },
  {
    id: "skin",
    icon: Sparkles,
    title: "Melhorar pele",
    desc: "Textura, acne, manchas, hidratação",
  },
  {
    id: "posture",
    icon: User,
    title: "Postura/Expressão",
    desc: "Postura corporal e expressões",
  },
  {
    id: "general",
    icon: Zap,
    title: "Evolução geral",
    desc: "Melhorar todos os aspectos",
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { setUserGoal } = useApp();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (selected) {
      setUserGoal(selected);
      navigate("/upload");
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      {/* Header */}
      <div className="flex justify-center mb-8">
        <Logo size="md" />
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        <div className="h-1 flex-1 bg-primary rounded-full" />
        <div className="h-1 flex-1 bg-border rounded-full" />
        <div className="h-1 flex-1 bg-border rounded-full" />
      </div>

      {/* Question */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold mb-2">Qual seu principal objetivo?</h1>
        <p className="text-muted-foreground">
          Escolha o foco da sua evolução
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {goals.map((goal, index) => (
          <Card
            key={goal.id}
            variant={selected === goal.id ? "neon" : "default"}
            className={`p-4 cursor-pointer transition-all duration-300 animate-slide-up ${
              selected === goal.id ? "scale-[1.02]" : "hover:border-primary/50"
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => setSelected(goal.id)}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  selected === goal.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                <goal.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{goal.title}</h3>
                <p className="text-sm text-muted-foreground">{goal.desc}</p>
              </div>
              {selected === goal.id && (
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Continue Button */}
      <Button
        variant="neon"
        size="lg"
        className="w-full"
        disabled={!selected}
        onClick={handleContinue}
      >
        Continuar
      </Button>
    </div>
  );
}
