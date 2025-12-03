import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/context/AppContext";
import { ChevronLeft, Droplets, Smile, Ruler, BookOpen } from "lucide-react";

const skinRecommendations = [
  {
    title: "Skincare Básico",
    tips: [
      "Lave o rosto 2x ao dia com sabonete suave",
      "Use um hidratante adequado ao seu tipo de pele",
      "Aplique protetor solar FPS 30+ diariamente",
    ],
  },
  {
    title: "Hidratação",
    tips: [
      "Beba no mínimo 2L de água por dia",
      "Use sérum hidratante com ácido hialurônico",
      "Evite banhos muito quentes",
    ],
  },
];

const jawlineRecommendations = [
  {
    title: "Mewing",
    tips: [
      "Posicione a língua inteira no céu da boca",
      "Mantenha os dentes levemente encostados",
      "Respire pelo nariz, não pela boca",
      "Pratique consistentemente ao longo do dia",
    ],
  },
  {
    title: "Postura",
    tips: [
      "Mantenha a coluna ereta ao sentar",
      "Queixo levemente para baixo, não para frente",
      "Evite olhar para baixo no celular por longos períodos",
    ],
  },
];

const symmetryRecommendations = [
  {
    title: "Sono",
    tips: [
      "Durma de barriga para cima quando possível",
      "Use travesseiro de altura adequada",
      "Evite dormir sempre do mesmo lado",
    ],
  },
  {
    title: "Mobilidade",
    tips: [
      "Faça exercícios leves de mobilidade mandibular",
      "Massageie os músculos faciais regularmente",
      "Evite apoiar o rosto na mão",
    ],
  },
];

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const { userData } = useApp();
  const scores = userData.scores;

  const recommendations = [];

  if (scores) {
    if (scores.skinQuality < 70) {
      recommendations.push({
        icon: Droplets,
        title: "Melhore sua Pele",
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        items: skinRecommendations,
      });
    }
    if (scores.jawline < 70) {
      recommendations.push({
        icon: Smile,
        title: "Defina a Mandíbula",
        color: "text-purple-400",
        bgColor: "bg-purple-500/20",
        items: jawlineRecommendations,
      });
    }
    if (scores.symmetry < 70) {
      recommendations.push({
        icon: Ruler,
        title: "Melhore a Simetria",
        color: "text-green-400",
        bgColor: "bg-green-500/20",
        items: symmetryRecommendations,
      });
    }
  }

  // Always show at least some recommendations
  if (recommendations.length === 0) {
    recommendations.push({
      icon: BookOpen,
      title: "Mantenha sua Evolução",
      color: "text-primary",
      bgColor: "bg-primary/20",
      items: [...skinRecommendations, ...jawlineRecommendations.slice(0, 1)],
    });
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-lg border-b border-border z-40 px-6 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg">Recomendações</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold mb-1">Dicas Personalizadas</h2>
          <p className="text-sm text-muted-foreground">
            Baseado na sua análise facial
          </p>
        </div>

        {recommendations.map((rec, index) => (
          <div key={index} className="space-y-4 animate-slide-up" style={{ animationDelay: `${index * 150}ms` }}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${rec.bgColor} rounded-xl flex items-center justify-center`}>
                <rec.icon className={`w-5 h-5 ${rec.color}`} />
              </div>
              <h3 className="font-bold text-lg">{rec.title}</h3>
            </div>

            {rec.items.map((item, itemIndex) => (
              <Card key={itemIndex} variant="glass" className="p-5">
                <h4 className="font-semibold mb-3 text-primary">{item.title}</h4>
                <ul className="space-y-2">
                  {item.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
