import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { useApp } from "@/context/AppContext";
import { Camera, Upload, Check, ChevronLeft, Loader2 } from "lucide-react";
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
  const [loadingPhoto, setLoadingPhoto] = useState<PhotoType | null>(null);

  // Controle de concorrência: se o usuário trocar rápido a mesma foto,
  // só aplicamos o último processamento.
  const latestProcessByTypeRef = useRef<Record<PhotoType, number>>({
    front: 0,
    leftProfile: 0,
    rightProfile: 0,
  });

  const activePreviewRef = useRef<Record<PhotoType, string | null>>({
    front: userData.photos.front,
    leftProfile: userData.photos.leftProfile,
    rightProfile: userData.photos.rightProfile,
  });

  const revokeIfBlobUrl = useCallback((maybeUrl: string | null | undefined) => {
    if (!maybeUrl) return;
    if (maybeUrl.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(maybeUrl);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    activePreviewRef.current = {
      front: userData.photos.front,
      leftProfile: userData.photos.leftProfile,
      rightProfile: userData.photos.rightProfile,
    };
  }, [userData.photos.front, userData.photos.leftProfile, userData.photos.rightProfile]);

  useEffect(() => {
    // Cleanup de objectURLs ao sair da página
    return () => {
      revokeIfBlobUrl(activePreviewRef.current.front);
      revokeIfBlobUrl(activePreviewRef.current.leftProfile);
      revokeIfBlobUrl(activePreviewRef.current.rightProfile);
    };
  }, [revokeIfBlobUrl]);
  
  // Refs separados para cada tipo de foto - CÂMERA
  const frontCameraRef = useRef<HTMLInputElement>(null);
  const leftCameraRef = useRef<HTMLInputElement>(null);
  const rightCameraRef = useRef<HTMLInputElement>(null);
  
  // Refs separados para cada tipo de foto - GALERIA  
  const frontGalleryRef = useRef<HTMLInputElement>(null);
  const leftGalleryRef = useRef<HTMLInputElement>(null);
  const rightGalleryRef = useRef<HTMLInputElement>(null);

  const fileToResizedBlobUrl = useCallback(
    (file: File) => {
      // Evita base64 (muito pesado) e reduz o tamanho antes do preview.
      // Isso reduz drasticamente picos de memória que podem causar “tela preta”.
      const MAX_DIMENSION = 1024;
      const JPEG_QUALITY = 0.82;

      return new Promise<string>((resolve, reject) => {
        const sourceUrl = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
          try {
            const srcW = img.naturalWidth || img.width;
            const srcH = img.naturalHeight || img.height;
            const maxSide = Math.max(srcW, srcH);
            const scale = maxSide > MAX_DIMENSION ? MAX_DIMENSION / maxSide : 1;

            const targetW = Math.max(1, Math.round(srcW * scale));
            const targetH = Math.max(1, Math.round(srcH * scale));

            const canvas = document.createElement("canvas");
            canvas.width = targetW;
            canvas.height = targetH;

            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Canvas 2D context unavailable");

            ctx.drawImage(img, 0, 0, targetW, targetH);

            canvas.toBlob(
              (blob) => {
                try {
                  if (!blob) throw new Error("Falha ao gerar blob");
                  const blobUrl = URL.createObjectURL(blob);
                  resolve(blobUrl);
                } catch (err) {
                  reject(err);
                } finally {
                  URL.revokeObjectURL(sourceUrl);
                }
              },
              "image/jpeg",
              JPEG_QUALITY
            );
          } catch (err) {
            URL.revokeObjectURL(sourceUrl);
            reject(err);
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(sourceUrl);
          reject(new Error("Erro ao decodificar a imagem"));
        };

        img.src = sourceUrl;
      });
    },
    []
  );

  // Handler genérico para processar arquivo selecionado
  const processFile = useCallback(
    async (type: PhotoType, file: File) => {
      latestProcessByTypeRef.current[type] += 1;
      const processId = latestProcessByTypeRef.current[type];

      // Limpa foto anterior (e libera memória se era blob URL)
      revokeIfBlobUrl(activePreviewRef.current[type]);
      setUserPhoto(type, null);
      setLoadingPhoto(type);

      try {
        const blobUrl = await fileToResizedBlobUrl(file);
        if (processId !== latestProcessByTypeRef.current[type]) return;

        // Se houve uma troca rápida, libera o URL recém criado também
        if (processId !== latestProcessByTypeRef.current[type]) {
          revokeIfBlobUrl(blobUrl);
          return;
        }

        activePreviewRef.current[type] = blobUrl;
        setUserPhoto(type, blobUrl);
        toast.success(`Foto ${photoTypes.find((p) => p.type === type)?.label} carregada!`);
      } catch (e) {
        if (processId !== latestProcessByTypeRef.current[type]) return;
        console.warn("Erro ao processar imagem", e);
        toast.error("Erro ao carregar a foto");
        // garante que não renderize preview com dados corrompidos
        setUserPhoto(type, null);
      } finally {
        if (processId === latestProcessByTypeRef.current[type]) {
          setLoadingPhoto(null);
        }
      }
    },
    [fileToResizedBlobUrl, revokeIfBlobUrl, setUserPhoto]
  );

  // Handlers específicos para cada tipo - evita conflitos de estado
  const handleFrontCamera = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile("front", file);
    e.target.value = "";
  }, [processFile]);

  const handleFrontGallery = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile("front", file);
    e.target.value = "";
  }, [processFile]);

  const handleLeftCamera = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile("leftProfile", file);
    e.target.value = "";
  }, [processFile]);

  const handleLeftGallery = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile("leftProfile", file);
    e.target.value = "";
  }, [processFile]);

  const handleRightCamera = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile("rightProfile", file);
    e.target.value = "";
  }, [processFile]);

  const handleRightGallery = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile("rightProfile", file);
    e.target.value = "";
  }, [processFile]);

  const openCamera = useCallback((type: PhotoType) => {
    if (type === "front") frontCameraRef.current?.click();
    else if (type === "leftProfile") leftCameraRef.current?.click();
    else rightCameraRef.current?.click();
  }, []);

  const openGallery = useCallback((type: PhotoType) => {
    if (type === "front") frontGalleryRef.current?.click();
    else if (type === "leftProfile") leftGalleryRef.current?.click();
    else rightGalleryRef.current?.click();
  }, []);

  const allPhotosUploaded =
    userData.photos.front && userData.photos.leftProfile && userData.photos.rightProfile;

  const canProceed = canAnalyze();

  const handleAnalyze = () => {
    if (!canProceed) {
      toast.error("Limite de análises atingido", {
        description: "Você já atingiu o limite de 3 análises nesta semana.",
      });
      return;
    }
    
    if (allPhotosUploaded) {
      setLoading(true);
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
      {/* CÂMERA - capture="environment" para câmera traseira */}
      <input
        type="file"
        ref={frontCameraRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={handleFrontCamera}
      />
      <input
        type="file"
        ref={leftCameraRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={handleLeftCamera}
      />
      <input
        type="file"
        ref={rightCameraRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={handleRightCamera}
      />
      
      {/* GALERIA - sem capture, abre apenas galeria */}
      <input
        type="file"
        ref={frontGalleryRef}
        className="hidden"
        accept="image/*"
        onChange={handleFrontGallery}
      />
      <input
        type="file"
        ref={leftGalleryRef}
        className="hidden"
        accept="image/*"
        onChange={handleLeftGallery}
      />
      <input
        type="file"
        ref={rightGalleryRef}
        className="hidden"
        accept="image/*"
        onChange={handleRightGallery}
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
          const photoData = userData.photos[photo.type];
          const hasPhoto = !!photoData && photoData.length > 0;
          const isLoading = loadingPhoto === photo.type;
          
          return (
            <Card
              key={photo.type}
              className={`p-4 transition-all duration-300 cursor-pointer active:scale-[0.98] ${
                hasPhoto 
                  ? "border-green-500/50 bg-green-500/5" 
                  : "border-primary/30 hover:border-primary/50"
              }`}
              onClick={() => !isLoading && openCamera(photo.type)}
            >
              <div className="flex items-center gap-4">
                {/* Preview da foto ou ícone de câmera */}
                <div className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center ${
                  hasPhoto ? "" : "bg-primary/10 border-2 border-dashed border-primary/30"
                }`}>
                  {isLoading ? (
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  ) : hasPhoto ? (
                    <img
                      src={photoData}
                      alt={photo.label}
                      className="w-full h-full object-cover"
                      onError={() => {
                        // Se imagem falhar, limpar estado
                        console.warn(`Erro ao carregar imagem ${photo.type}`);
                        revokeIfBlobUrl(userData.photos[photo.type]);
                        setUserPhoto(photo.type, null);
                      }}
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-primary" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{photo.label}</span>
                    {hasPhoto && !isLoading && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? "Carregando..." : hasPhoto ? "Toque para trocar" : "Toque para tirar foto"}
                  </p>
                </div>

                {/* Botão galeria - secundário */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 flex-shrink-0"
                  disabled={isLoading}
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
