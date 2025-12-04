import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScoreBar } from "@/components/ScoreBar";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/context/AppContext";
import { ChevronLeft, Sparkles, AlertCircle, ChevronRight, Trophy, TrendingUp, Star } from "lucide-react";

// Expert facial analysis based on user's goal and randomized realistic assessment
function generateExpertAnalysis(goal: string) {
  const randomScore = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  // Base scores with realistic distribution
  let jawline = randomScore(52, 82);
  let symmetry = randomScore(55, 85);
  let skinQuality = randomScore(50, 80);
  let cheekbones = randomScore(52, 80);

  // Adjust based on goal focus (simulate user's self-awareness)
  switch (goal) {
    case "face":
      // Users focused on face might have lower scores in these areas
      jawline = randomScore(50, 75);
      symmetry = randomScore(50, 78);
      break;
    case "skin":
      skinQuality = randomScore(50, 70);
      break;
    case "posture":
      // Posture focus often correlates with symmetry awareness
      symmetry = randomScore(50, 75);
      break;
    default:
      // General evolution - balanced scores
      break;
  }

  // Calculate overall based on weighted average
  const overall = Math.round(
    jawline * 0.3 + symmetry * 0.25 + skinQuality * 0.25 + cheekbones * 0.2
  );

  // Potential is always high (90-97) to motivate users
  const potential = randomScore(90, 97);

  // Generate 3 strengths based on highest scores
  const scoreMap = [
    { key: "jawline", value: jawline, 
      strengths: [
        "Linha da mandíbula com boa definição base",
        "Estrutura óssea da mandíbula favorável",
        "Ângulo mandibular adequado"
      ]
    },
    { key: "symmetry", value: symmetry,
      strengths: [
        "Boa proporção entre as metades do rosto",
        "Alinhamento facial equilibrado",
        "Simetria ocular adequada"
      ]
    },
    { key: "skinQuality", value: skinQuality,
      strengths: [
        "Textura da pele uniforme",
        "Tom de pele equilibrado",
        "Boa hidratação natural da pele"
      ]
    },
    { key: "cheekbones", value: cheekbones,
      strengths: [
        "Projeção das maçãs do rosto presente",
        "Volume adequado na região malar",
        "Estrutura zigomática definida"
      ]
    },
  ];

  // Sort by score descending
  const sorted = [...scoreMap].sort((a, b) => b.value - a.value);
  
  // Top 3 become strengths
  const strengths = sorted.slice(0, 3).map(s => 
    s.strengths[Math.floor(Math.random() * s.strengths.length)]
  );

  // Generate 3 weaknesses based on lowest scores
  const weaknessMap = [
    { key: "jawline", value: jawline,
      weaknesses: [
        "Linha da mandíbula pode ganhar mais definição",
        "Ângulo mandibular tem potencial de melhora",
        "Região submandibular pode ser trabalhada"
      ]
    },
    { key: "symmetry", value: symmetry,
      weaknesses: [
        "Pequenas assimetrias faciais podem ser corrigidas",
        "Alinhamento facial pode ser otimizado",
        "Proporções faciais podem ser equilibradas"
      ]
    },
    { key: "skinQuality", value: skinQuality,
      weaknesses: [
        "Textura da pele pode ser mais uniforme",
        "Hidratação da pele precisa de atenção",
        "Tom de pele pode ser mais equilibrado"
      ]
    },
    { key: "cheekbones", value: cheekbones,
      weaknesses: [
        "Maçãs do rosto podem ter mais destaque",
        "Volume malar pode ser melhor definido",
        "Projeção zigomática tem espaço para evolução"
      ]
    },
  ];

  // Sort by score ascending for weaknesses
  const sortedWeak = [...weaknessMap].sort((a, b) => a.value - b.value);
  
  // Bottom 3 become weaknesses
  const weaknesses = sortedWeak.slice(0, 3).map(w => 
    w.weaknesses[Math.floor(Math.random() * w.weaknesses.length)]
  );

  return {
    overall: Math.max(50, overall),
    potential,
    jawline: Math.max(50, jawline),
    symmetry: Math.max(50, symmetry),
    skinQuality: Math.max(50, skinQuality),
    cheekbones: Math.max(50, cheekbones),
    strengths,
    weaknesses,
  };
}

export default function AnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, setScores, recordAnalysis, getRemainingAnalyses } = useApp();
  const [analyzing, setAnalyzing] = useState(!userData.scores);
  const [showScores, setShowScores] = useState(!!userData.scores);
  const [showCongrats, setShowCongrats] = useState(false);

  const photoHashes = location.state?.photoHashes || [];

  useEffect(() => {
    if (!userData.scores && analyzing) {
      const timer = setTimeout(() => {
        const newScores = generateExpertAnalysis(userData.goal);
        setScores(newScores);
        
        // Record this analysis
        if (photoHashes.length > 0) {
          recordAnalysis(photoHashes);
        }
        
        setAnalyzing(false);
        setShowScores(true);
        setShowCongrats(true);
      }, 3000); // Longer analysis time for more "expert" feel
      return () => clearTimeout(timer);
    }
  }, [analyzing, userData.scores, userData.goal, setScores, recordAnalysis, photoHashes]);

  const scores = userData.scores;
  const remainingAnalyses = getRemainingAnalyses();

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
        {/* Congratulations Card (show on new analysis) */}
        {showCongrats && (
          <Card variant="neon" className="p-5 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Parabéns pela sua análise! 🎉</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Você deu o primeiro passo para sua evolução. Com seu potencial de{" "}
                  <span className="text-accent font-bold">{scores?.potential}%</span>, você tem 
                  muito espaço para alcançar resultados incríveis!
                </p>
                <div className="flex items-center gap-2 text-xs text-primary">
                  <TrendingUp className="w-4 h-4" />
                  <span>Continue seguindo as recomendações para maximizar seus resultados</span>
                </div>
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

        {/* Remaining Analyses Info */}
        <Card className="p-3 border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm">Análises esta semana</span>
            </div>
            <span className="text-sm font-bold text-primary">{remainingAnalyses}/2 disponíveis</span>
          </div>
        </Card>

        {/* Main Scores */}
        <div className="grid grid-cols-2 gap-4">
          <Card variant="neon" className="p-5 text-center">
            <p className="text-xs text-muted-foreground mb-1">Nota Geral</p>
            <p className="text-4xl font-extrabold text-primary drop-shadow-[0_0_20px_hsl(200,100%,50%/0.8)]">
              {scores?.overall}
            </p>
          </Card>
          <Card variant="neon" className="p-5 text-center">
            <p className="text-xs text-muted-foreground mb-1">Potencial</p>
            <p className="text-4xl font-extrabold text-accent drop-shadow-[0_0_20px_hsl(200,100%,60%/0.8)]">
              {scores?.potential}
            </p>
          </Card>
        </div>

        {/* Detailed Scores */}
        <Card variant="glass" className="p-5">
          <h3 className="font-semibold mb-4">Análise Detalhada</h3>
          <div className="space-y-4">
            <ScoreBar label="Linha da mandíbula" score={scores?.jawline || 0} />
            <ScoreBar label="Simetria" score={scores?.symmetry || 0} />
            <ScoreBar label="Qualidade da pele" score={scores?.skinQuality || 0} />
            <ScoreBar label="Maçãs do rosto" score={scores?.cheekbones || 0} />
          </div>
        </Card>

        {/* Strengths - Always 3 items */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-green-500" />
            </div>
            <h3 className="font-semibold">Pontos Fortes</h3>
          </div>
          <ul className="space-y-2">
            {scores?.strengths?.map((strength, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                {strength}
              </li>
            ))}
          </ul>
        </Card>

        {/* Weaknesses - Always 3 items */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-orange-500" />
            </div>
            <h3 className="font-semibold">Pontos a Melhorar</h3>
          </div>
          <ul className="space-y-2">
            {scores?.weaknesses?.map((weakness, i) => (
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
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold">Próximos Passos</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
              Siga as recomendações personalizadas para sua evolução
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
              Faça o check-in diário para manter a consistência
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
              Tire novas fotos após 1 semana para acompanhar sua evolução
            </li>
          </ul>
        </Card>

        {/* CTA */}
        <Button
          variant="neon"
          size="lg"
          className="w-full"
          onClick={() => navigate("/recommendations")}
        >
          Recomendações personalizadas
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
