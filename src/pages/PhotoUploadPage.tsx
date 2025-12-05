import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { useApp } from "@/context/AppContext";
import { Camera, Upload, Check, User, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

type PhotoType = "front" | "leftProfile" | "rightProfile";

const photoTypes: { type: PhotoType; label: string; icon: string }[] = [
  { type: "front", label: "Frente", icon: "😐" },
  { type: "leftProfile", label: "Perfil Esquerdo", icon: "👤" },
  { type: "rightProfile", label: "Perfil Direito", icon: "👤" },
];

export default function PhotoUploadPage() {
  const navigate = useNavigate();
  const { userData, setUserPhoto, canAnalyze } = useApp();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeType, setActiveType] = useState<PhotoType>("front");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUserPhoto(activeType, result);
      toast.success(`Foto ${photoTypes.find(p => p.type === activeType)?.label} carregada!`);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    e.target.value = "";
  };

  const handleCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      fileInputRef.current?.click();
    } catch {
      fileInputRef.current?.click();
    }
  };

  const allPhotosUploaded =
    userData.photos.front && userData.photos.leftProfile && userData.photos.rightProfile;

  const canProceed = canAnalyze();

  const handleAnalyze = () => {
    if (!canProceed) {
      toast.error("Limite de análises atingido", {
        description: "Você já usou suas 2 análises desta semana. Aguarde a próxima semana.",
      });
      return;
    }
    
    if (allPhotosUploaded) {
      setLoading(true);
      setTimeout(() => {
        navigate("/analysis", { state: { newAnalysis: true } });
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <Logo size="sm" showText={false} />
        <div className="w-10" />
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        <div className="h-1 flex-1 bg-primary rounded-full" />
        <div className="h-1 flex-1 bg-primary rounded-full" />
        <div className="h-1 flex-1 bg-border rounded-full" />
      </div>

      {/* Title */}
      <div className="text-center mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold mb-2">Envie suas fotos</h1>
        <p className="text-muted-foreground text-sm">
          3 fotos para uma análise completa
        </p>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {photoTypes.map((photo) => {
          const hasPhoto = userData.photos[photo.type];
          const isActive = activeType === photo.type;
          return (
            <Card
              key={photo.type}
              variant={isActive ? "neon" : "default"}
              className={`aspect-square flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden ${
                isActive ? "scale-105" : ""
              }`}
              onClick={() => setActiveType(photo.type)}
            >
              {hasPhoto ? (
                <div className="relative w-full h-full">
                  <img
                    src={userData.photos[photo.type]!}
                    alt={photo.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
              ) : (
                <>
                  <User className="w-8 h-8 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">{photo.label}</span>
                </>
              )}
            </Card>
          );
        })}
      </div>

      {/* Upload Section */}
      <Card variant="glass" className="p-6 mb-6">
        <h3 className="font-semibold mb-4 text-center">
          {photoTypes.find(p => p.type === activeType)?.label}
        </h3>
        <div className="flex gap-3">
          <Button
            variant="neonOutline"
            className="flex-1"
            onClick={handleCamera}
          >
            <Camera className="w-5 h-5" />
            Câmera
          </Button>
          <Button
            variant="neonOutline"
            className="flex-1"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-5 h-5" />
            Galeria
          </Button>
        </div>
      </Card>

      {/* Status */}
      <div className="flex justify-center gap-2 mb-6">
        {photoTypes.map((photo) => (
          <div
            key={photo.type}
            className={`w-3 h-3 rounded-full transition-colors ${
              userData.photos[photo.type] ? "bg-green-500" : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Analyze Button */}
      <Button
        variant="neon"
        size="lg"
        className="w-full"
        disabled={!allPhotosUploaded || loading}
        onClick={handleAnalyze}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Analisando...
          </div>
        ) : (
          "Analisar rosto"
        )}
      </Button>
    </div>
  );
}
