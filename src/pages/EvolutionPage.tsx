import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/context/AppContext";
import { Camera, Upload, Plus, Calendar, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const periods = [
  { value: "1week", label: "1 semana" },
  { value: "1month", label: "1 mês" },
  { value: "3months", label: "3 meses" },
  { value: "custom", label: "Personalizado" },
];

export default function EvolutionPage() {
  const navigate = useNavigate();
  const { userData, addEvolution } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState("1month");
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [activeUpload, setActiveUpload] = useState<"before" | "after" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUpload) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (activeUpload === "before") {
          setBeforePhoto(result);
        } else {
          setAfterPhoto(result);
        }
        toast.success("Foto carregada!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = (type: "before" | "after") => {
    setActiveUpload(type);
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    if (beforePhoto && afterPhoto) {
      addEvolution({
        before: beforePhoto,
        after: afterPhoto,
        period: selectedPeriod,
      });
      setBeforePhoto(null);
      setAfterPhoto(null);
      toast.success("Evolução salva!");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />

      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-lg border-b border-border z-40 px-6 py-4">
        <h1 className="font-bold text-lg text-center">Evolução</h1>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Period Selection */}
        <Card variant="glass" className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Período de comparação
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedPeriod === period.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Photo Comparison */}
        <div className="grid grid-cols-2 gap-4">
          {/* Before */}
          <Card
            variant={beforePhoto ? "neon" : "default"}
            className="aspect-[3/4] flex flex-col items-center justify-center cursor-pointer overflow-hidden"
            onClick={() => handleUploadClick("before")}
          >
            {beforePhoto ? (
              <img src={beforePhoto} alt="Antes" className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-2">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">Antes</span>
                <span className="text-xs text-muted-foreground">Adicionar foto</span>
              </>
            )}
          </Card>

          {/* After */}
          <Card
            variant={afterPhoto ? "neon" : "default"}
            className="aspect-[3/4] flex flex-col items-center justify-center cursor-pointer overflow-hidden"
            onClick={() => handleUploadClick("after")}
          >
            {afterPhoto ? (
              <img src={afterPhoto} alt="Depois" className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-2">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">Depois</span>
                <span className="text-xs text-muted-foreground">Adicionar foto</span>
              </>
            )}
          </Card>
        </div>

        {/* Save Button */}
        {beforePhoto && afterPhoto && (
          <Button variant="neon" size="lg" className="w-full" onClick={handleSave}>
            Salvar comparação
          </Button>
        )}

        {/* Timeline */}
        {userData.evolution.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Histórico de Evolução</h3>
            {userData.evolution.map((entry, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <img
                      src={entry.before!}
                      alt="Antes"
                      className="w-16 h-20 object-cover rounded-lg"
                    />
                    <ArrowRight className="w-4 h-4 text-muted-foreground self-center" />
                    <img
                      src={entry.after!}
                      alt="Depois"
                      className="w-16 h-20 object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {periods.find((p) => p.value === entry.period)?.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date().toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
