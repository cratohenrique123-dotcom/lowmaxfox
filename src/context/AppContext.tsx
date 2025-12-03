import React, { createContext, useContext, useState, useEffect } from "react";

interface UserData {
  goal: string;
  photos: {
    front: string | null;
    leftProfile: string | null;
    rightProfile: string | null;
  };
  scores: {
    overall: number;
    potential: number;
    jawline: number;
    symmetry: number;
    skinQuality: number;
    cheekbones: number;
  } | null;
  checkins: Record<string, string[]>;
  evolution: {
    before: string | null;
    after: string | null;
    period: string;
  }[];
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
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData>(() => {
    const saved = localStorage.getItem("lowmax_userData");
    return saved ? JSON.parse(saved) : defaultUserData;
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
