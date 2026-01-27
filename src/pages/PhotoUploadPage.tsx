import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { useApp } from "@/context/AppContext";
import { Camera, Upload, Check, ChevronLeft, Loader2, Sun, User, EyeOff, Sparkles } from "lucide-react";
import { toast } from "sonner";

type PhotoSource = "camera" | "gallery";

export default function PhotoUploadPage() {
  const navigate = useNavigate();
  const { userData, setUserPhoto, canAnalyze } = useApp();
  const [loading, setLoading] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(false);

  // Controle de concorrência
  const latestProcessRef = useRef(0);
  const activePreviewRef = useRef<string | null>(userData.photos.front);

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

  const nextFrame = useCallback(() => {
    return new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }, []);

  async function getImageDimensionsFromFile(
    file: File
  ): Promise<{ width: number; height: number } | null> {
    const header = await file.slice(0, 256 * 1024).arrayBuffer();
    const view = new DataView(header);

    const isPng =
      view.byteLength >= 24 &&
      view.getUint32(0) === 0x89504e47 &&
      view.getUint32(4) === 0x0d0a1a0a;

    if (isPng) {
      const width = view.getUint32(16);
      const height = view.getUint32(20);
      if (width > 0 && height > 0) return { width, height };
      return null;
    }

    const isJpeg = view.byteLength >= 4 && view.getUint16(0) === 0xffd8;
    if (isJpeg) {
      let offset = 2;
      while (offset + 9 < view.byteLength) {
        if (view.getUint8(offset) !== 0xff) {
          offset += 1;
          continue;
        }
        const marker = view.getUint8(offset + 1);

        if (marker === 0xd8 || marker === 0xd9) {
          offset += 2;
          continue;
        }

        if (offset + 4 >= view.byteLength) break;
        const blockLength = view.getUint16(offset + 2);
        if (blockLength < 2) break;

        const isSOF =
          (marker >= 0xc0 && marker <= 0xc3) ||
          (marker >= 0xc5 && marker <= 0xc7) ||
          (marker >= 0xc9 && marker <= 0xcb) ||
          (marker >= 0xcd && marker <= 0xcf);

        if (isSOF) {
          if (offset + 9 >= view.byteLength) break;
          const height = view.getUint16(offset + 5);
          const width = view.getUint16(offset + 7);
          if (width > 0 && height > 0) return { width, height };
          return null;
        }

        offset += 2 + blockLength;
      }
    }

    return null;
  }

  useEffect(() => {
    activePreviewRef.current = userData.photos.front;
  }, [userData.photos.front]);

  useEffect(() => {
    return () => {
      revokeIfBlobUrl(activePreviewRef.current);
    };
  }, [revokeIfBlobUrl]);
  
  // Single photo refs
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const fileToResizedBlobUrl = useCallback(async (file: File, source: PhotoSource) => {
    const BASE_MAX_DIMENSION = 1024;
    const JPEG_QUALITY = 0.82;

    const maxDimension = file.size > 10 * 1024 * 1024 ? 768 : BASE_MAX_DIMENSION;

    const dims = await getImageDimensionsFromFile(file).catch(() => null);
    const srcW = dims?.width;
    const srcH = dims?.height;
    const scale =
      srcW && srcH ? Math.min(1, maxDimension / Math.max(srcW, srcH)) : 1;

    const targetW =
      srcW && srcH ? Math.max(1, Math.round(srcW * scale)) : maxDimension;
    const targetH =
      srcW && srcH ? Math.max(1, Math.round(srcH * scale)) : maxDimension;

    // Camera photos bypass createImageBitmap to prevent mobile crashes
    if (source !== "camera" && "createImageBitmap" in window) {
      try {
        const bitmap: ImageBitmap = await createImageBitmap(
          file,
          {
            ...(dims ? { resizeWidth: targetW, resizeHeight: targetH } : {}),
            resizeQuality: "high",
          } as any
        );

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, bitmap.width);
        canvas.height = Math.max(1, bitmap.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D context unavailable");
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => {
              if (!b) return reject(new Error("Falha ao gerar blob"));
              resolve(b);
            },
            "image/jpeg",
            JPEG_QUALITY
          );
        });

        canvas.width = 0;
        canvas.height = 0;

        return URL.createObjectURL(blob);
      } catch (err) {
        console.warn("createImageBitmap/Canvas falhou, usando fallback", err);
      }
    }

    // Fallback: Image() + objectURL (always used for camera)
    return new Promise<string>((resolve, reject) => {
      const sourceUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        try {
          const srcW2 = img.naturalWidth || img.width;
          const srcH2 = img.naturalHeight || img.height;
          const maxSide = Math.max(srcW2, srcH2);
          const scale2 = maxSide > maxDimension ? maxDimension / maxSide : 1;

          const w = Math.max(1, Math.round(srcW2 * scale2));
          const h = Math.max(1, Math.round(srcH2 * scale2));

          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas 2D context unavailable");
          ctx.drawImage(img, 0, 0, w, h);

          canvas.toBlob(
            (blob) => {
              try {
                if (!blob) throw new Error("Falha ao gerar blob");
                const blobUrl = URL.createObjectURL(blob);
                resolve(blobUrl);
              } catch (e) {
                reject(e);
              } finally {
                try {
                  URL.revokeObjectURL(sourceUrl);
                } catch {
                  // ignore
                }
                img.src = "";
                canvas.width = 0;
                canvas.height = 0;
              }
            },
            "image/jpeg",
            JPEG_QUALITY
          );
        } catch (e) {
          try {
            URL.revokeObjectURL(sourceUrl);
          } catch {
            // ignore
          }
          img.src = "";
          reject(e);
        }
      };

      img.onerror = () => {
        try {
          URL.revokeObjectURL(sourceUrl);
        } catch {
          // ignore
        }
        img.src = "";
        reject(new Error("Erro ao decodificar a imagem"));
      };

      img.src = sourceUrl;
    });
  }, []);

  const processFile = useCallback(
    async (file: File, source: PhotoSource) => {
      latestProcessRef.current += 1;
      const processId = latestProcessRef.current;

      const prevUrl = activePreviewRef.current;
      activePreviewRef.current = null;
      setUserPhoto("front", null);
      setLoadingPhoto(true);

      await nextFrame();
      revokeIfBlobUrl(prevUrl);

      try {
        console.info(`[upload] start processing (id=${processId}, size=${file.size}, source=${source})`);
        const blobUrl = await fileToResizedBlobUrl(file, source);
        if (processId !== latestProcessRef.current) {
          revokeIfBlobUrl(blobUrl);
          return;
        }

        activePreviewRef.current = blobUrl;
        setUserPhoto("front", blobUrl);
        toast.success("Foto carregada com sucesso!");
        console.info(`[upload] done (id=${processId})`);
      } catch (e) {
        if (processId !== latestProcessRef.current) return;
        console.warn("Erro ao processar imagem", e);
        toast.error("Erro ao carregar a foto");
        setUserPhoto("front", null);
      } finally {
        if (processId === latestProcessRef.current) {
          setLoadingPhoto(false);
        }
      }
    },
    [fileToResizedBlobUrl, nextFrame, revokeIfBlobUrl, setUserPhoto]
  );

  const handleCamera = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file, "camera");
    e.target.value = "";
  }, [processFile]);

  const handleGallery = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file, "gallery");
    e.target.value = "";
  }, [processFile]);

  const openCamera = useCallback(() => {
    cameraRef.current?.click();
  }, []);

  const openGallery = useCallback(() => {
    galleryRef.current?.click();
  }, []);

  const hasPhoto = !!userData.photos.front && userData.photos.front.length > 0;
  const canProceed = canAnalyze();

  const handleAnalyze = () => {
    if (!canProceed) {
      toast.error("Limite de análises atingido", {
        description: "Você já atingiu o limite de 3 análises nesta semana.",
      });
      return;
    }
    
    if (hasPhoto) {
      setLoading(true);
      navigate("/analysis", { state: { newAnalysis: true }, replace: true });
    }
  };

  const guidelines = [
    { icon: User, text: "Foto frontal do rosto" },
    { icon: Sun, text: "Boa iluminação" },
    { icon: Sparkles, text: "Rosto completo visível" },
    { icon: EyeOff, text: "Sem óculos ou acessórios" },
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      {/* Hidden inputs */}
      <input
        type="file"
        ref={cameraRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={handleCamera}
      />
      <input
        type="file"
        ref={galleryRef}
        className="hidden"
        accept="image/*"
        onChange={handleGallery}
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
            ✓ Análise disponível. Envie sua foto.
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
      <div className="text-center mb-6 animate-fade-in">
        <h1 className="text-xl font-bold mb-1">Envie sua foto</h1>
        <p className="text-muted-foreground text-sm">
          Uma foto frontal para análise facial
        </p>
      </div>

      {/* Photo Guidelines */}
      <Card className="p-4 mb-6 border-primary/20 bg-primary/5">
        <h3 className="text-sm font-semibold mb-3 text-center">📸 Dicas para uma boa foto</h3>
        <div className="grid grid-cols-2 gap-3">
          {guidelines.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
              <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Single Photo Card */}
      <Card
        className={`p-6 transition-all duration-300 cursor-pointer active:scale-[0.98] mb-6 ${
          hasPhoto 
            ? "border-green-500/50 bg-green-500/5" 
            : "border-primary/30 hover:border-primary/50"
        }`}
        onClick={() => !loadingPhoto && openCamera()}
      >
        <div className="flex flex-col items-center gap-4">
          {/* Preview or Camera Icon */}
          <div className={`w-32 h-32 rounded-2xl overflow-hidden flex items-center justify-center ${
            hasPhoto ? "" : "bg-primary/10 border-2 border-dashed border-primary/30"
          }`}>
            {loadingPhoto ? (
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            ) : hasPhoto ? (
              <img
                src={userData.photos.front!}
                alt="Sua foto"
                className="w-full h-full object-cover"
                onError={() => {
                  console.warn("Erro ao carregar imagem");
                  revokeIfBlobUrl(userData.photos.front);
                  setUserPhoto("front", null);
                }}
              />
            ) : (
              <Camera className="w-12 h-12 text-primary" />
            )}
          </div>

          {/* Info */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="font-semibold">Foto Frontal</span>
              {hasPhoto && !loadingPhoto && (
                <Check className="w-5 h-5 text-green-500" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {loadingPhoto ? "Carregando..." : hasPhoto ? "Toque para trocar" : "Toque para tirar foto"}
            </p>
          </div>

          {/* Gallery Button */}
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            disabled={loadingPhoto}
            onClick={(e) => {
              e.stopPropagation();
              openGallery();
            }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Escolher da galeria
          </Button>
        </div>
      </Card>

      {/* Analyze Button */}
      <Button
        variant="neon"
        size="lg"
        className="w-full"
        disabled={!hasPhoto || loading || !canProceed}
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
