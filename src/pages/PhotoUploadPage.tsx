import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { useApp } from "@/context/AppContext";
import { Camera, Upload, Check, ChevronLeft } from "lucide-react";
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
  
  // Refs separados para cada tipo de foto - evita conflitos
  const frontCameraRef = useRef<HTMLInputElement>(null);
  const frontGalleryRef = useRef<HTMLInputElement>(null);
  const leftCameraRef = useRef<HTMLInputElement>(null);
  const leftGalleryRef = useRef<HTMLInputElement>(null);
  const rightCameraRef = useRef<HTMLInputElement>(null);
  const rightGalleryRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (type: PhotoType) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setUserPhoto(type, result);
        toast.success(`Foto ${photoTypes.find(p => p.type === type)?.label} carregada!`);
      }
    };
    reader.onerror = () => {
      toast.error("Erro ao carregar a foto");
    };
    reader.readAsDataURL(file);
    
    // Reset input para permitir selecionar a mesma foto novamente
    e.target.value = "";
  };

  const getCameraRef = (type: PhotoType) => {
    if (type === "front") return frontCameraRef;
    if (type === "leftProfile") return leftCameraRef;
    return rightCameraRef;
  };

  const getGalleryRef = (type: PhotoType) => {
    if (type === "front") return frontGalleryRef;
    if (type === "leftProfile") return leftGalleryRef;
    return rightGalleryRef;
  };

  const openCamera = (type: PhotoType) => {
    getCameraRef(type).current?.click();
  };

  const openGallery = (type: PhotoType) => {
    getGalleryRef(type).current?.click();
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
      // Navegar diretamente sem delay para evitar problemas de estado
      navigate("/analysis", { state: { newAnalysis: true }, replace: true });
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
      {/* Inputs separados por tipo de foto - CÂMERA */}
      <input
        type="file"
        ref={frontCameraRef}
        className="hidden"
        accept="image/*"
        capture="user"
        onChange={handleFileSelect("front")}
      />
      <input
        type="file"
        ref={leftCameraRef}
        className="hidden"
        accept="image/*"
        capture="user"
        onChange={handleFileSelect("leftProfile")}
      />
      <input
        type="file"
        ref={rightCameraRef}
        className="hidden"
        accept="image/*"
        capture="user"
        onChange={handleFileSelect("rightProfile")}
      />
      
      {/* Inputs separados por tipo de foto - GALERIA */}
      <input
        type="file"
        ref={frontGalleryRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect("front")}
      />
      <input
        type="file"
        ref={leftGalleryRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect("leftProfile")}
      />
      <input
        type="file"
        ref={rightGalleryRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect("rightProfile")}
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

      {/* Photo Cards - Toque para abrir câmera diretamente */}
      <div className="space-y-3 mb-6">
        {photoTypes.map((photo) => {
          const hasPhoto = userData.photos[photo.type];
          return (
            <Card
              key={photo.type}
              className={`p-4 transition-all duration-300 cursor-pointer active:scale-[0.98] ${
                hasPhoto 
                  ? "border-green-500/50 bg-green-500/5" 
                  : "border-primary/30 hover:border-primary/50"
              }`}
              onClick={() => openCamera(photo.type)}
            >
              <div className="flex items-center gap-4">
                {/* Preview da foto ou ícone de câmera */}
                <div className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center ${
                  hasPhoto ? "" : "bg-primary/10 border-2 border-dashed border-primary/30"
                }`}>
                  {hasPhoto ? (
                    <img
                      src={userData.photos[photo.type]!}
                      alt={photo.label}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-primary" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{photo.label}</span>
                    {hasPhoto && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {hasPhoto ? "Toque para trocar" : "Toque para tirar foto"}
                  </p>
                </div>

                {/* Botão galeria - secundário */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    openGallery(photo.type);
                  }}
                >
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </Button>
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
