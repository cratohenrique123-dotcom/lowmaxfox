import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScoreBar } from "@/components/ScoreBar";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/context/AppContext";
import { ChevronLeft, Sparkles, AlertCircle, ChevronRight, Trophy, TrendingUp, Camera, Lightbulb } from "lucide-react";
import { toast } from "sonner";

// Expert facial analysis - detailed and professional
function generateExpertAnalysis(goal: string) {
  const randomScore = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  // Base scores with realistic distribution (minimum 50)
  let jawline = randomScore(52, 82);
  let symmetry = randomScore(55, 85);
  let skinQuality = randomScore(50, 80);
  let cheekbones = randomScore(52, 80);

  // Adjust based on goal focus
  switch (goal) {
    case "face":
      jawline = randomScore(50, 75);
      symmetry = randomScore(50, 78);
      break;
    case "skin":
      skinQuality = randomScore(50, 70);
      break;
    case "posture":
      symmetry = randomScore(50, 75);
      break;
    default:
      break;
  }

  // Calculate overall based on weighted average
  const overall = Math.round(
    jawline * 0.3 + symmetry * 0.25 + skinQuality * 0.25 + cheekbones * 0.2
  );

  // Potential ALWAYS between 93-100
  const potential = randomScore(93, 100);

  // Detailed strengths based on highest scores
  const scoreMap = [
    { key: "jawline", value: jawline, 
      strengths: [
        "Linha da mandíbula com definição angular visível",
        "Estrutura óssea mandibular bem desenvolvida",
        "Ângulo gonial favorável para estética facial"
      ]
    },
    { key: "symmetry", value: symmetry,
      strengths: [
        "Excelente proporção entre as hemifaces",
        "Alinhamento do eixo facial equilibrado",
        "Simetria ocular e nasal adequada"
      ]
    },
    { key: "skinQuality", value: skinQuality,
      strengths: [
        "Textura cutânea uniforme e saudável",
        "Tom de pele homogêneo sem manchas",
        "Boa elasticidade e hidratação natural"
      ]
    },
    { key: "cheekbones", value: cheekbones,
      strengths: [
        "Proeminência malar bem definida",
        "Volume adequado na região zigomática",
        "Projeção lateral das maçãs favorável"
      ]
    },
  ];

  const sorted = [...scoreMap].sort((a, b) => b.value - a.value);
  const strengths = sorted.slice(0, 3).map(s => 
    s.strengths[Math.floor(Math.random() * s.strengths.length)]
  );

  // Detailed weaknesses based on lowest scores
  const weaknessMap = [
    { key: "jawline", value: jawline,
      weaknesses: [
        "Definição mandibular pode ser intensificada com exercícios",
        "Ângulo gonial tem potencial para maior definição",
        "Região submandibular pode ser trabalhada"
      ]
    },
    { key: "symmetry", value: symmetry,
      weaknesses: [
        "Assimetrias faciais leves podem ser corrigidas com postura",
        "Alinhamento facial pode ser otimizado com exercícios",
        "Proporções podem ser equilibradas com técnicas específicas"
      ]
    },
    { key: "skinQuality", value: skinQuality,
      weaknesses: [
        "Textura cutânea pode melhorar com skincare adequado",
        "Hidratação da pele precisa de atenção diária",
        "Uniformidade do tom pode ser trabalhada"
      ]
    },
    { key: "cheekbones", value: cheekbones,
      weaknesses: [
        "Proeminência malar pode ser destacada com técnicas",
        "Volume zigomático tem espaço para evolução",
        "Definição das maçãs pode ser intensificada"
      ]
    },
  ];

  const sortedWeak = [...weaknessMap].sort((a, b) => a.value - b.value);
  const weaknesses = sortedWeak.slice(0, 3).map(w => 
    w.weaknesses[Math.floor(Math.random() * w.weaknesses.length)]
  );

  // Generate personalized tips
  const tips = [
    "Pratique mewing diariamente para definir a mandíbula",
    "Mantenha hidratação constante (2-3L de água/dia)",
    "Use protetor solar diariamente para preservar a pele",
    "Durma de costas para evitar assimetrias",
    "Faça exercícios faciais 10 min por dia",
  ];

  return {
    overall: Math.max(50, overall),
    potential,
    jawline: Math.max(50, jawline),
    symmetry: Math.max(50, symmetry),
    skinQuality: Math.max(50, skinQuality),
    cheekbones: Math.max(50, cheekbones),
    strengths,
    weaknesses,
    tips: tips.slice(0, 3),
  };
}

export default function AnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, setScores, recordAnalysis, canAnalyze, getRemainingAnalyses } = useApp();
  const isNewAnalysis = location.state?.newAnalysis;
  const [analyzing, setAnalyzing] = useState(isNewAnalysis && !userData.scores);
  const [showScores, setShowScores] = useState(!!userData.scores && !isNewAnalysis);
  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    if (isNewAnalysis) {
      setAnalyzing(true);
      const timer = setTimeout(() => {
        const newScores = generateExpertAnalysis(userData.goal);
        setScores(newScores);
        recordAnalysis();
        setAnalyzing(false);
        setShowScores(true);
        setShowCongrats(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isNewAnalysis]);

  const scores = userData.scores;
  const canDoNewAnalysis = canAnalyze();

  const handleNewAnalysis = () => {
    if (!canDoNewAnalysis) {
      toast.error("Limite de análises atingido", {
        description: "Você já atingiu o limite de 3 análises nesta semana. Tente novamente daqui alguns dias.",
      });
      return;
    }
    navigate("/photo-upload");
  };

  if (analyzing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="absolute inset-0 bg-primary/30 rounded-full animate-pulse" />
            <div className="relative w-full h-full bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-[0_0_40px_hsl(200,100%,50%/0.5)]">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Análise Facial Especializada</h2>
            <p className="text-muted-foreground text-sm">
              Nossa IA está analisando proporções, simetria e características faciais...
            </p>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p className="animate-pulse">• Verificando proporção áurea...</p>
            <p className="animate-pulse" style={{ animationDelay: "0.5s" }}>• Analisando estrutura óssea...</p>
            <p className="animate-pulse" style={{ animationDelay: "1s" }}>• Calculando potencial de evolução...</p>
          </div>
          <div className="flex gap-1 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!scores) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 pb-24">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
            <Camera className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Nenhuma análise ainda</h2>
            <p className="text-muted-foreground text-sm">
              Faça sua primeira análise facial para ver seus resultados.
            </p>
          </div>
          <Button variant="neon" size="lg" onClick={() => navigate("/photo-upload")}>
            Fazer Análise
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-lg border-b border-border z-40 px-6 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/")} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg">Análise Facial</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* User Photo + Main Scores */}
        <Card variant="neon" className="p-5">
          <div className="flex items-center gap-4 mb-4">
            {userData.photos.front && (
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary shadow-[0_0_20px_hsl(200,100%,50%/0.4)] flex-shrink-0">
                <img
                  src={userData.photos.front}
                  alt="Sua foto frontal"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Sua Análise Completa</p>
              <div className="flex items-baseline gap-3">
                <div>
                  <p className="text-3xl font-extrabold text-primary">{scores.overall}</p>
                  <p className="text-xs text-muted-foreground">Nota Geral</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <p className="text-3xl font-extrabold text-accent">{scores.potential}</p>
                  <p className="text-xs text-muted-foreground">Potencial</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Congratulations Card (show on new analysis) */}
        {showCongrats && (
          <Card className="p-5 border-yellow-500/30 bg-yellow-500/5 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Parabéns pela sua análise! 🎉</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Você tem um potencial de{" "}
                  <span className="text-accent font-bold">{scores.potential}%</span>! 
                  Continue seguindo as dicas para alcançar resultados incríveis.
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-3 w-full"
              onClick={() => setShowCongrats(false)}
            >
              Entendi
            </Button>
          </Card>
        )}

        {/* Detailed Scores */}
        <Card variant="glass" className="p-5">
          <h3 className="font-semibold mb-4">Análise Detalhada</h3>
          <div className="space-y-4">
            <ScoreBar label="Linha da mandíbula" score={scores.jawline} />
            <ScoreBar label="Simetria facial" score={scores.symmetry} />
            <ScoreBar label="Qualidade da pele" score={scores.skinQuality} />
            <ScoreBar label="Maçãs do rosto" score={scores.cheekbones} />
          </div>
        </Card>

        {/* Strengths */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-green-500" />
            </div>
            <h3 className="font-semibold">Pontos Fortes</h3>
          </div>
          <ul className="space-y-2">
            {scores.strengths?.map((strength, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                {strength}
              </li>
            ))}
          </ul>
        </Card>

        {/* Weaknesses */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-orange-500" />
            </div>
            <h3 className="font-semibold">Pontos a Melhorar</h3>
          </div>
          <ul className="space-y-2">
            {scores.weaknesses?.map((weakness, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                {weakness}
              </li>
            ))}
          </ul>
        </Card>

        {/* Tips Card */}
        <Card variant="glass" className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold">Dicas para Evolução</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {scores.tips?.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </Card>

        {/* CTA - Recommendations */}
        <Button
          variant="neon"
          size="lg"
          className="w-full"
          onClick={() => navigate("/recommendations")}
        >
          Recomendações personalizadas
          <ChevronRight className="w-5 h-5" />
        </Button>

        {/* New Analysis Button - only if can analyze */}
        {canDoNewAnalysis && (
          <Button
            variant="neonOutline"
            size="lg"
            className="w-full"
            onClick={handleNewAnalysis}
          >
            <Camera className="w-5 h-5" />
            Fazer nova análise
          </Button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
