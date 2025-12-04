// Simple perceptual hash for image comparison
export async function getImageHash(imageDataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Create small canvas for hashing (8x8)
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = 8;
      canvas.height = 8;
      
      // Draw scaled image
      ctx.drawImage(img, 0, 0, 8, 8);
      
      // Get pixel data
      const imageData = ctx.getImageData(0, 0, 8, 8);
      const pixels = imageData.data;
      
      // Convert to grayscale and calculate average
      const grays: number[] = [];
      for (let i = 0; i < pixels.length; i += 4) {
        const gray = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
        grays.push(gray);
      }
      
      const avg = grays.reduce((a, b) => a + b, 0) / grays.length;
      
      // Generate hash
      let hash = "";
      for (const gray of grays) {
        hash += gray > avg ? "1" : "0";
      }
      
      resolve(hash);
    };
    img.onerror = () => resolve("");
    img.src = imageDataUrl;
  });
}

// Calculate similarity between two hashes (0-100%)
export function calculateSimilarity(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length || hash1.length === 0) return 0;
  
  let same = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] === hash2[i]) same++;
  }
  
  return (same / hash1.length) * 100;
}

// Check if image contains a human face (basic detection using canvas analysis)
export async function detectFace(imageDataUrl: string): Promise<{ hasHumanFace: boolean; confidence: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      // Simple skin tone detection
      let skinPixels = 0;
      let totalPixels = pixels.length / 4;
      
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        // Check for skin tone ranges
        if (isSkinTone(r, g, b)) {
          skinPixels++;
        }
      }
      
      const skinRatio = skinPixels / totalPixels;
      
      // A face image typically has 15-60% skin tone pixels
      const hasHumanFace = skinRatio > 0.10 && skinRatio < 0.70;
      const confidence = hasHumanFace ? Math.min(skinRatio * 2, 1) * 100 : skinRatio * 100;
      
      resolve({ hasHumanFace, confidence });
    };
    img.onerror = () => resolve({ hasHumanFace: false, confidence: 0 });
    img.src = imageDataUrl;
  });
}

function isSkinTone(r: number, g: number, b: number): boolean {
  // Multiple skin tone ranges for different ethnicities
  const conditions = [
    // Light skin
    r > 95 && g > 40 && b > 20 && 
    r > g && r > b && 
    Math.abs(r - g) > 15 && 
    r - b > 15,
    // Medium skin
    r > 60 && g > 40 && b > 30 &&
    r > g && r > b &&
    r - g < 80,
    // Darker skin
    r > 45 && g > 30 && b > 20 &&
    r > g && g > b,
  ];
  
  return conditions.some(c => c);
}

// Compare photos to detect duplicates
export async function checkForDuplicates(
  newPhotoHash: string,
  existingHashes: string[],
  threshold: number = 85
): Promise<{ isDuplicate: boolean; similarityScore: number; mostSimilarIndex: number }> {
  let maxSimilarity = 0;
  let mostSimilarIndex = -1;
  
  for (let i = 0; i < existingHashes.length; i++) {
    const similarity = calculateSimilarity(newPhotoHash, existingHashes[i]);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      mostSimilarIndex = i;
    }
  }
  
  return {
    isDuplicate: maxSimilarity >= threshold,
    similarityScore: maxSimilarity,
    mostSimilarIndex,
  };
}
