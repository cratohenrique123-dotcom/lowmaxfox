import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScoreBar } from "@/components/ScoreBar";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/context/AppContext";
import { ChevronLeft, Sparkles, AlertCircle, ChevronRight, Trophy, Camera, Lightbulb } from "lucide-react";
import { toast } from "sonner";

// Convert blob URL to base64
async function blobUrlToBase64(blobUrl: string): Promise<string> {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix if present
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Call the AI edge function to analyze the face
async function analyzeWithAI(imageBase64: string): Promise<{
  overall: number;
  potential: number;
  jawline: number;
  symmetry: number;
  skinQuality: number;
  cheekbones: number;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
}> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Configuração do servidor não encontrada");
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/analyze-face`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ imageBase64 }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 429) {
      throw new Error("Limite de requisições atingido. Tente novamente em alguns minutos.");
    }
    if (response.status === 402) {
      throw new Error("Créditos esgotados. Entre em contato com o suporte.");
    }
    throw new Error(errorData.error || "Erro ao analisar imagem");
  }

  return response.json();
}

export default function AnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, setScores, recordAnalysis, canAnalyze, getRemainingAnalyses, resetPhotos } = useApp();
  const isNewAnalysis = location.state?.newAnalysis;
  const [analyzing, setAnalyzing] = useState(!!isNewAnalysis);
  const [showCongrats, setShowCongrats] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const hasRunRef = React.useRef(false);

  useEffect(() => {
    // ONLY run analysis when coming from photo upload with newAnalysis flag
    if (isNewAnalysis && !hasRunRef.current) {
      hasRunRef.current = true;
      setAnalyzing(true);
      
      // Check if we have the photo
      const hasPhoto = userData.photos.front;
      
      if (!hasPhoto) {
        navigate("/photo-upload", { replace: true });
        return;
      }
      
      // Run AI analysis
      const runAnalysis = async () => {
        try {
          // Animate steps
          const stepInterval = setInterval(() => {
            setAnalysisStep(prev => Math.min(prev + 1, 3));
          }, 1500);

          // Convert blob URL to base64
          console.log("Converting image to base64...");
          const imageBase64 = await blobUrlToBase64(userData.photos.front!);
          console.log("Image converted, calling AI...");

          // Call AI
          const newScores = await analyzeWithAI(imageBase64);
          
          clearInterval(stepInterval);
          
          // Save scores
          setScores(newScores);
          recordAnalysis(userData.photos.front || undefined);
          setAnalyzing(false);
          setShowCongrats(true);
          
          // Clear navigation state
          window.history.replaceState({}, document.title);
          
          toast.success("Análise concluída!", {
            description: "Sua análise facial foi realizada com sucesso.",
          });
        } catch (error) {
          console.error("Analysis error:", error);
          setAnalyzing(false);
          toast.error("Erro na análise", {
            description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
          });
          navigate("/photo-upload", { replace: true });
        }
      };
      
      runAnalysis();
    } else if (!isNewAnalysis) {
      setAnalyzing(false);
    }
  }, [isNewAnalysis, userData.photos, navigate, setScores, recordAnalysis]);

  const scores = userData.scores;
  const canDoNewAnalysis = canAnalyze();

  const handleNewAnalysis = () => {
    if (!canDoNewAnalysis) {
      toast.error("Limite de análises atingido", {
        description: "Você já atingiu o limite de 3 análises nesta semana. Tente novamente daqui alguns dias.",
      });
      return;
    }
    resetPhotos();
    navigate("/photo-upload");
  };

  if (analyzing) {
    const steps = [
      "Processando imagem...",
      "Analisando estrutura facial...",
      "Calculando métricas...",
      "Gerando resultados personalizados...",
    ];

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
            <h2 className="text-xl font-bold mb-2">Análise Facial com IA</h2>
            <p className="text-muted-foreground text-sm">
              Nossa IA está analisando sua foto em detalhes...
            </p>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            {steps.map((step, i) => (
              <p
                key={i}
                className={`transition-all duration-500 ${
                  i <= analysisStep ? "opacity-100" : "opacity-30"
                } ${i === analysisStep ? "animate-pulse text-primary font-medium" : ""}`}
              >
                {i <= analysisStep ? "✓" : "•"} {step}
              </p>
            ))}
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
            {(userData.photos.front || userData.lastAnalysisPhoto) && (
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary shadow-[0_0_20px_hsl(200,100%,50%/0.4)] flex-shrink-0">
                <img
                  src={userData.photos.front || userData.lastAnalysisPhoto!}
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

        {/* Congratulations Card */}
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
            <ScoreBar label="Qualidade da pele" score={scores.skinQuality} />
            <ScoreBar label="Linha da mandíbula" score={scores.jawline} />
            <ScoreBar label="Maçãs do rosto" score={scores.cheekbones} />
            <ScoreBar label="Simetria facial" score={scores.symmetry} />
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

        {/* New Analysis Button */}
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
          <Card className="p-3 border-orange-500/20 bg-orange-500/5">
            <p className="text-sm text-orange-400 text-center">
              Limite semanal atingido. Você poderá fazer nova análise em breve.
            </p>
          </Card>
        )}

        {/* Remaining analyses */}
        <p className="text-xs text-center text-muted-foreground">
          {getRemainingAnalyses()} {getRemainingAnalyses() === 1 ? "análise restante" : "análises restantes"} esta semana
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
