import React, { createContext, useContext, useState, useEffect } from "react";

interface AnalysisResult {
  overall: number;
  potential: number;
  jawline: number;
  symmetry: number;
  skinQuality: number;
  cheekbones: number;
  strengths: string[];
  weaknesses: string[];
}

interface UserData {
  goal: string;
  photos: {
    front: string | null;
    leftProfile: string | null;
    rightProfile: string | null;
  };
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
  setUserPhoto: (type: "front" | "leftProfile" | "rightProfile", photo: string) => void;
  setScores: (scores: UserData["scores"]) => void;
  addCheckin: (date: string, habits: string[]) => void;
  addEvolution: (entry: UserData["evolution"][0]) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  canAnalyze: () => boolean;
  recordAnalysis: (photoHashes: string[]) => void;
  getRemainingAnalyses: () => number;
}

const defaultUserData: UserData = {
  goal: "",
  photos: {
    front: null,
    leftProfile: null,
    rightProfile: null,
  },
  scores: null,
  checkins: {},
  evolution: [],
  analysisHistory: [],
  lastAnalysisDate: null,
  weeklyAnalysisCount: 0,
  weekStartDate: null,
};

const AppContext = createContext<AppContextType | null>(null);

// Helper to get the start of the current week (Monday)
function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split("T")[0];
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
    localStorage.setItem("lowmax_userData", JSON.stringify(userData));
  }, [userData]);

  useEffect(() => {
    localStorage.setItem("lowmax_loggedIn", String(isLoggedIn));
  }, [isLoggedIn]);

  // Check if week has reset
  useEffect(() => {
    const currentWeekStart = getWeekStart();
    if (userData.weekStartDate !== currentWeekStart) {
      setUserData((prev) => ({
        ...prev,
        weeklyAnalysisCount: 0,
        weekStartDate: currentWeekStart,
      }));
    }
  }, [userData.weekStartDate]);

  const setUserGoal = (goal: string) => {
    setUserData((prev) => ({ ...prev, goal }));
  };

  const setUserPhoto = (type: "front" | "leftProfile" | "rightProfile", photo: string) => {
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

  const canAnalyze = (): boolean => {
    const currentWeekStart = getWeekStart();
    if (userData.weekStartDate !== currentWeekStart) {
      return true; // New week, can analyze
    }
    return userData.weeklyAnalysisCount < 2;
  };

  const getRemainingAnalyses = (): number => {
    const currentWeekStart = getWeekStart();
    if (userData.weekStartDate !== currentWeekStart) {
      return 2;
    }
    return Math.max(0, 2 - userData.weeklyAnalysisCount);
  };

  const recordAnalysis = (photoHashes: string[]) => {
    const today = new Date().toISOString().split("T")[0];
    const currentWeekStart = getWeekStart();
    
    setUserData((prev) => ({
      ...prev,
      analysisHistory: [
        ...prev.analysisHistory,
        { date: today, photoHashes },
      ],
      lastAnalysisDate: today,
      weeklyAnalysisCount: prev.weekStartDate === currentWeekStart 
        ? prev.weeklyAnalysisCount + 1 
        : 1,
      weekStartDate: currentWeekStart,
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
