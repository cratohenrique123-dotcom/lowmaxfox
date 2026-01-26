import React, { createContext, useContext, useState, useEffect } from "react";

// ========================================
// LIMITE DE ANÁLISES SEMANAIS
// Altere este valor para ajustar o limite
// Produção: 3 | Teste: 10
// ========================================
const WEEKLY_ANALYSIS_LIMIT = 10;

interface AnalysisResult {
  overall: number;
  potential: number;
  jawline: number;
  symmetry: number;
  skinQuality: number;
  cheekbones: number;
  strengths: string[];
  weaknesses: string[];
  tips?: string[];
}

interface UserData {
  goal: string;
  photos: {
    front: string | null;
    leftProfile: string | null;
    rightProfile: string | null;
  };
  lastAnalysisPhoto: string | null; // Foto frontal da última análise
  scores: AnalysisResult | null;
  checkins: Record<string, string[]>;
  evolution: {
    before: string | null;
    after: string | null;
    period: string;
  }[];
  analysisHistory: {
    date: string;
    photoHashes: string[];
  }[];
  lastAnalysisDate: string | null;
  weeklyAnalysisCount: number;
  weekStartDate: string | null;
}

interface AppContextType {
  userData: UserData;
  setUserGoal: (goal: string) => void;
  setUserPhoto: (
    type: "front" | "leftProfile" | "rightProfile",
    photo: string | null
  ) => void;
  setScores: (scores: UserData["scores"]) => void;
  addCheckin: (date: string, habits: string[]) => void;
  addEvolution: (entry: UserData["evolution"][0]) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  canAnalyze: () => boolean;
  recordAnalysis: (frontPhoto?: string) => void;
  getRemainingAnalyses: () => number;
  resetPhotos: () => void;
}

const defaultUserData: UserData = {
  goal: "",
  photos: {
    front: null,
    leftProfile: null,
    rightProfile: null,
  },
  lastAnalysisPhoto: null,
  scores: null,
  checkins: {},
  evolution: [],
  analysisHistory: [],
  lastAnalysisDate: null,
  weeklyAnalysisCount: 0,
  weekStartDate: null,
};

const AppContext = createContext<AppContextType | null>(null);

// Helper to get analyses in the last 7 days
function getAnalysesInLast7Days(history: { date: string }[]): number {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return history.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= sevenDaysAgo && entryDate <= now;
  }).length;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData>(() => {
    const saved = localStorage.getItem("lowmax_userData");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration for older data
      return {
        ...defaultUserData,
        ...parsed,
        lastAnalysisPhoto: parsed.lastAnalysisPhoto || null,
        analysisHistory: parsed.analysisHistory || [],
        weeklyAnalysisCount: parsed.weeklyAnalysisCount || 0,
        weekStartDate: parsed.weekStartDate || null,
      };
    }
    return defaultUserData;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("lowmax_loggedIn") === "true";
  });

  useEffect(() => {
    // Salvar dados no localStorage, excluindo fotos (muito grandes)
    // IMPORTANTE: Mantemos os scores salvos para não perder as notas!
    const dataToSave = {
      ...userData,
      // Preservar scores - NUNCA remover!
      scores: userData.scores,
      // IMPORTANTE: não persistir foto (base64) no localStorage (pode estourar quota e travar a UI)
      lastAnalysisPhoto: null,
      photos: {
        front: null,
        leftProfile: null,
        rightProfile: null,
      },
      evolution: userData.evolution.map(e => ({
        ...e,
        before: null,
        after: null,
      })),
    };
    try {
      localStorage.setItem("lowmax_userData", JSON.stringify(dataToSave));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }, [userData]);

  useEffect(() => {
    localStorage.setItem("lowmax_loggedIn", String(isLoggedIn));
  }, [isLoggedIn]);


  const setUserGoal = (goal: string) => {
    setUserData((prev) => ({ ...prev, goal }));
  };

  const setUserPhoto = (type: "front" | "leftProfile" | "rightProfile", photo: string | null) => {
    setUserData((prev) => ({
      ...prev,
      photos: { ...prev.photos, [type]: photo },
    }));
  };

  const setScores = (scores: UserData["scores"]) => {
    setUserData((prev) => ({ ...prev, scores }));
  };

  const addCheckin = (date: string, habits: string[]) => {
    setUserData((prev) => ({
      ...prev,
      checkins: { ...prev.checkins, [date]: habits },
    }));
  };

  const addEvolution = (entry: UserData["evolution"][0]) => {
    setUserData((prev) => ({
      ...prev,
      evolution: [...prev.evolution, entry],
    }));
  };

  const resetPhotos = () => {
    setUserData((prev) => ({
      ...prev,
      photos: {
        front: null,
        leftProfile: null,
        rightProfile: null,
      },
    }));
  };

  const canAnalyze = (): boolean => {
    const recentAnalyses = getAnalysesInLast7Days(userData.analysisHistory);
    return recentAnalyses < WEEKLY_ANALYSIS_LIMIT;
  };

  const getRemainingAnalyses = (): number => {
    const recentAnalyses = getAnalysesInLast7Days(userData.analysisHistory);
    return Math.max(0, WEEKLY_ANALYSIS_LIMIT - recentAnalyses);
  };

  const recordAnalysis = (frontPhoto?: string) => {
    const now = new Date().toISOString();
    
    setUserData((prev) => ({
      ...prev,
      lastAnalysisDate: now,
      lastAnalysisPhoto: frontPhoto || prev.photos.front || prev.lastAnalysisPhoto,
      analysisHistory: [...prev.analysisHistory, { date: now, photoHashes: [] }],
    }));
  };

  return (
    <AppContext.Provider
      value={{
        userData,
        setUserGoal,
        setUserPhoto,
        setScores,
        addCheckin,
        addEvolution,
        isLoggedIn,
        setIsLoggedIn,
        canAnalyze,
        recordAnalysis,
        getRemainingAnalyses,
        resetPhotos,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
