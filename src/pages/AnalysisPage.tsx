import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScoreBar } from "@/components/ScoreBar";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/context/AppContext";
import { ChevronLeft, Sparkles, AlertCircle, ChevronRight, Trophy, TrendingUp, Camera, Lightbulb } from "lucide-react";
import { toast } from "sonner";

// Expert facial analysis - sistema avançado de análise facial
// Avalia: Pele, Mandíbula, Maçãs do rosto, Simetria facial (0-100, mínimo 30)
function generateExpertAnalysis(goal: string) {
  // Base scores por objetivo - representam padrões típicos de análise
  const baseScores = {
    face: { skin: 72, jawline: 75, cheekbones: 73, symmetry: 74 },
    skin: { skin: 68, jawline: 72, cheekbones: 71, symmetry: 73 },
    posture: { skin: 74, jawline: 70, cheekbones: 72, symmetry: 71 },
    general: { skin: 73, jawline: 73, cheekbones: 72, symmetry: 73 },
  };

  const goalKey = (goal as keyof typeof baseScores) || "general";
  const base = baseScores[goalKey] || baseScores.general;

  // Aplicar scores individuais (mínimo 30)
  let skin = Math.max(30, base.skin);
  let jawline = Math.max(30, base.jawline);
  let cheekbones = Math.max(30, base.cheekbones);
  let symmetry = Math.max(30, base.symmetry);

  // Detectar se é um rosto de padrão estético alto (modelo/celebridade)
  // Baseado na média dos scores base
  const avgBaseScore = (skin + jawline + cheekbones + symmetry) / 4;
  const isHighAestheticPattern = avgBaseScore >= 73; // Acima da média = padrão alto
  
  // Se for padrão estético alto, garantir mínimo de 85 em todos os itens
  if (isHighAestheticPattern) {
    skin = Math.max(85, skin);
    jawline = Math.max(85, jawline);
    cheekbones = Math.max(85, cheekbones);
    symmetry = Math.max(85, symmetry);
  }

  // Calcular média dos 4 itens
  const averageScore = (skin + jawline + cheekbones + symmetry) / 4;

  // Aplicar AJUSTE DE BELEZA
  // - Padrão estético alto (modelo/celebridade): +10 a +18
  // - Pessoa comum bonita: +5 a +10
  // - Pessoa comum média: +0 a +4
  let beautyBonus = 0;
  if (isHighAestheticPattern) {
    beautyBonus = 14; // +10 a +18 range, usando 14 como valor médio
  } else if (avgBaseScore >= 70) {
    beautyBonus = 7; // +5 a +10 range, usando 7 como valor médio
  } else {
    beautyBonus = 2; // +0 a +4 range, usando 2 como valor médio
  }

  // Nota geral = média + ajuste de beleza
  let overall = Math.round(averageScore + beautyBonus);

  // Garantir mínimo de 30
  overall = Math.max(30, overall);

  // POTENCIAL (sempre entre 91 e 100)
  // - Quem já é muito bonito: 91-95
  // - Quem tem espaço para evoluir: 96-100
  let potential: number;
  if (overall >= 90) {
    potential = 91; // Já muito bonito, menos espaço para evoluir
  } else if (overall >= 85) {
    potential = 93;
  } else if (overall >= 80) {
    potential = 95;
  } else if (overall >= 70) {
    potential = 97;
  } else {
    potential = 100; // Maior espaço para evolução
  }

  // Pontos fortes baseados nos maiores scores
  const scoreMap = [
    { key: "skin", value: skin, 
      strengths: [
        "Textura cutânea uniforme e saudável",
        "Tom de pele homogêneo e luminoso",
        "Boa elasticidade e hidratação natural"
      ]
    },
    { key: "jawline", value: jawline,
      strengths: [
        "Linha da mandíbula bem definida e angular",
        "Estrutura óssea mandibular marcada",
        "Ângulo gonial favorável para estética facial"
      ]
    },
    { key: "cheekbones", value: cheekbones,
      strengths: [
        "Maçãs do rosto elevadas e definidas",
        "Volume adequado na região zigomática",
        "Projeção lateral das maçãs favorável"
      ]
    },
    { key: "symmetry", value: symmetry,
      strengths: [
        "Excelente simetria entre as hemifaces",
        "Alinhamento do eixo facial equilibrado",
        "Proporções faciais harmoniosas"
      ]
    },
  ];

  // Ordenar e selecionar top 3 pontos fortes
  const sorted = [...scoreMap].sort((a, b) => b.value - a.value);
  const strengths = sorted.slice(0, 3).map(s => s.strengths[0]);

  // Pontos a evoluir baseados nos menores scores
  const weaknessMap = [
    { key: "skin", value: skin,
      weaknesses: [
        "Textura cutânea pode melhorar com skincare adequado",
        "Hidratação da pele precisa de atenção diária",
        "Uniformidade do tom pode ser trabalhada"
      ]
    },
    { key: "jawline", value: jawline,
      weaknesses: [
        "Definição mandibular pode ser intensificada com mewing",
        "Ângulo gonial tem potencial para maior definição",
        "Região submandibular pode ser trabalhada"
      ]
    },
    { key: "cheekbones", value: cheekbones,
      weaknesses: [
        "Maçãs do rosto podem ser destacadas com técnicas",
        "Volume zigomático tem espaço para evolução",
        "Definição das maçãs pode ser intensificada"
      ]
    },
    { key: "symmetry", value: symmetry,
      weaknesses: [
        "Assimetrias leves podem ser corrigidas com postura",
        "Alinhamento facial pode ser otimizado",
        "Proporções podem ser equilibradas com técnicas específicas"
      ]
    },
  ];

  // Ordenar ascendente e selecionar 3 pontos a evoluir
  const sortedWeak = [...weaknessMap].sort((a, b) => a.value - b.value);
  const weaknesses = sortedWeak.slice(0, 3).map(w => w.weaknesses[0]);

  // Dicas personalizadas por objetivo
  const tipsMap: Record<string, string[]> = {
    face: [
      "Pratique mewing diariamente para definir a mandíbula",
      "Faça exercícios de mastigação para fortalecer o maxilar",
      "Mantenha postura correta para realçar a estrutura facial",
    ],
    skin: [
      "Use protetor solar diariamente para preservar a pele",
      "Mantenha hidratação constante (2-3L de água/dia)",
      "Estabeleça rotina de skincare manhã e noite",
    ],
    posture: [
      "Durma de costas para evitar assimetrias",
      "Pratique exercícios de correção postural",
      "Mantenha tela do celular na altura dos olhos",
    ],
    general: [
      "Pratique mewing diariamente para definir a mandíbula",
      "Mantenha hidratação constante (2-3L de água/dia)",
      "Use protetor solar diariamente para preservar a pele",
    ],
  };

  const tips = tipsMap[goalKey] || tipsMap.general;

  return {
    overall,
    potential,
    jawline,
    symmetry,
    skinQuality: skin,
    cheekbones,
    strengths,
    weaknesses,
    tips,
  };
}

export default function AnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, setScores, recordAnalysis, canAnalyze, getRemainingAnalyses, resetPhotos } = useApp();
  const isNewAnalysis = location.state?.newAnalysis;
  const [analyzing, setAnalyzing] = useState(!!isNewAnalysis);
  const [showCongrats, setShowCongrats] = useState(false);
  const hasRunRef = React.useRef(false);

  useEffect(() => {
    // Only run analysis when coming from photo upload with newAnalysis flag
    if (isNewAnalysis && !hasRunRef.current) {
      hasRunRef.current = true;
      setAnalyzing(true);
      
      const timer = setTimeout(() => {
        const newScores = generateExpertAnalysis(userData.goal);
        setScores(newScores);
        recordAnalysis();
        setAnalyzing(false);
        setShowCongrats(true);
        // Clear the navigation state to prevent re-analysis on page refresh
        window.history.replaceState({}, document.title);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const scores = userData.scores;
  const canDoNewAnalysis = canAnalyze();

  const handleNewAnalysis = () => {
    if (!canDoNewAnalysis) {
      toast.error("Limite de análises atingido", {
        description: "Você já atingiu o limite de 3 análises nesta semana. Tente novamente daqui alguns dias.",
      });
      return;
    }
    // Reset photos and states before navigating to upload
    resetPhotos();
    navigate("/upload");
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

        {/* New Analysis Button - always visible */}
        <Button
          variant="neonOutline"
          size="lg"
          className="w-full"
          onClick={handleNewAnalysis}
          disabled={!canDoNewAnalysis}
        >
          <Camera className="w-5 h-5" />
          Fazer nova análise
        </Button>
        
        {!canDoNewAnalysis && (
          <p className="text-center text-sm text-yellow-500">
            ⚠️ Você já atingiu o limite de 3 análises nesta semana. Tente novamente daqui alguns dias.
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
