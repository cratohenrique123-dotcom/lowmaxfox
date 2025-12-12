import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { useApp } from "@/context/AppContext";
import { Camera, Upload, Check, User, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

type PhotoType = "front" | "leftProfile" | "rightProfile";

const photoTypes: { type: PhotoType; label: string }[] = [
  { type: "front", label: "Frente" },
  { type: "leftProfile", label: "Perfil Esquerdo" },
  { type: "rightProfile", label: "Perfil Direito" },
];

export default function PhotoUploadPage() {
  const navigate = useNavigate();
  const { userData, setUserPhoto, canAnalyze } = useApp();
  const [loading, setLoading] = useState(false);
  const [pendingType, setPendingType] = useState<PhotoType | null>(null);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingType) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setUserPhoto(pendingType, result);
        toast.success(`Foto ${photoTypes.find(p => p.type === pendingType)?.label} carregada!`);
      }
      setPendingType(null);
    };
    reader.onerror = () => {
      toast.error("Erro ao carregar a foto");
      setPendingType(null);
    };
    reader.readAsDataURL(file);
    
    // Reset input para permitir selecionar a mesma foto novamente
    e.target.value = "";
  };

  const openCamera = (type: PhotoType) => {
    setPendingType(type);
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const openGallery = (type: PhotoType) => {
    setPendingType(type);
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  const allPhotosUploaded =
    userData.photos.front && userData.photos.leftProfile && userData.photos.rightProfile;

  const canProceed = canAnalyze();

  const handleAnalyze = () => {
    if (!canProceed) {
      toast.error("Limite de análises atingido", {
        description: "Você já atingiu o limite de 3 análises nesta semana. Tente novamente daqui alguns dias.",
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

  const getPhotoCount = () => {
    let count = 0;
    if (userData.photos.front) count++;
    if (userData.photos.leftProfile) count++;
    if (userData.photos.rightProfile) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      {/* Input para câmera - capture="environment" para usar câmera traseira, ou "user" para frontal */}
      <input
        type="file"
        ref={cameraInputRef}
        className="hidden"
        accept="image/*"
        capture="user"
        onChange={handleFileSelect}
      />
      
      {/* Input para galeria - sem capture para abrir galeria */}
      <input
        type="file"
        ref={galleryInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <Logo size="sm" showText={false} />
        <div className="w-10" />
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-6">
        <div className="h-1 flex-1 bg-primary rounded-full" />
        <div className="h-1 flex-1 bg-primary rounded-full" />
        <div className="h-1 flex-1 bg-border rounded-full" />
      </div>

      {/* Status Message */}
      {canProceed ? (
        <Card className="p-3 mb-4 border-green-500/30 bg-green-500/10">
          <p className="text-sm text-green-400 text-center font-medium">
            ✓ Análise disponível. Envie suas fotos.
          </p>
        </Card>
      ) : (
        <Card className="p-3 mb-4 border-orange-500/30 bg-orange-500/10">
          <p className="text-sm text-orange-400 text-center font-medium">
            ⚠️ Limite semanal atingido. Tente novamente nos próximos dias.
          </p>
        </Card>
      )}

      {/* Title */}
      <div className="text-center mb-4 animate-fade-in">
        <h1 className="text-xl font-bold mb-1">Envie suas fotos</h1>
        <p className="text-muted-foreground text-sm">
          {getPhotoCount()}/3 fotos enviadas
        </p>
      </div>

      {/* Photo Cards - Cada card tem botões diretos */}
      <div className="space-y-3 mb-6">
        {photoTypes.map((photo) => {
          const hasPhoto = userData.photos[photo.type];
          return (
            <Card
              key={photo.type}
              className={`p-3 transition-all duration-300 ${
                hasPhoto ? "border-green-500/50 bg-green-500/5" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Preview da foto ou placeholder */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                  {hasPhoto ? (
                    <img
                      src={userData.photos[photo.type]!}
                      alt={photo.label}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>

                {/* Info e botões */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">{photo.label}</span>
                    {hasPhoto && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  
                  {/* Botões de ação diretos */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 text-xs"
                      onClick={() => openCamera(photo.type)}
                    >
                      <Camera className="w-3 h-3 mr-1" />
                      Câmera
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 text-xs"
                      onClick={() => openGallery(photo.type)}
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Galeria
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Status dots */}
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
        disabled={!allPhotosUploaded || loading || !canProceed}
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
