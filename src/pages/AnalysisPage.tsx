import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScoreBar } from "@/components/ScoreBar";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/context/AppContext";
import { ChevronLeft, Sparkles, AlertCircle, ChevronRight } from "lucide-react";

function generateScores() {
  // Generate realistic scores based on rules (no score < 50, potential 90-97)
  const randomScore = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  return {
    overall: randomScore(55, 85),
    potential: randomScore(90, 97),
    jawline: randomScore(50, 88),
    symmetry: randomScore(52, 90),
    skinQuality: randomScore(50, 85),
    cheekbones: randomScore(50, 87),
  };
}

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { userData, setScores } = useApp();
  const [analyzing, setAnalyzing] = useState(!userData.scores);
  const [showScores, setShowScores] = useState(!!userData.scores);

  useEffect(() => {
    if (!userData.scores && analyzing) {
      const timer = setTimeout(() => {
        const newScores = generateScores();
        setScores(newScores);
        setAnalyzing(false);
        setShowScores(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [analyzing, userData.scores, setScores]);

  const scores = userData.scores;

  const getStrengths = () => {
    if (!scores) return [];
    const strengths = [];
    if (scores.jawline >= 70) strengths.push("Linha da mandíbula bem definida");
    if (scores.symmetry >= 70) strengths.push("Boa simetria facial");
    if (scores.skinQuality >= 70) strengths.push("Qualidade de pele acima da média");
    if (scores.cheekbones >= 70) strengths.push("Maçãs do rosto proeminentes");
    if (strengths.length === 0) strengths.push("Potencial de evolução alto");
    return strengths;
  };

  const getWeaknesses = () => {
    if (!scores) return [];
    const weaknesses = [];
    if (scores.jawline < 70) weaknesses.push("Linha da mandíbula pode melhorar");
    if (scores.symmetry < 70) weaknesses.push("Simetria facial pode ser aprimorada");
    if (scores.skinQuality < 70) weaknesses.push("Qualidade da pele precisa de atenção");
    if (scores.cheekbones < 70) weaknesses.push("Maçãs do rosto menos definidas");
    return weaknesses;
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
            <h2 className="text-xl font-bold mb-2">Analisando seu rosto...</h2>
            <p className="text-muted-foreground text-sm">
              Nossa IA está processando suas fotos
            </p>
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

        {/* Strengths */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-green-500" />
            </div>
            <h3 className="font-semibold">Pontos Fortes</h3>
          </div>
          <ul className="space-y-2">
            {getStrengths().map((strength, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
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
            {getWeaknesses().map((weakness, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                {weakness}
              </li>
            ))}
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
