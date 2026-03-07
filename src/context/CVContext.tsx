"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { type CVData, defaultCVData } from "@/types/cv";

interface CVContextType {
  cvData: CVData;
  setCvData: (data: CVData) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const CVContext = createContext<CVContextType | null>(null);

export function CVProvider({ children }: { children: ReactNode }) {
  const [cvData, setCvDataState] = useState<CVData>(defaultCVData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setCvData = useCallback((data: CVData) => {
    setCvDataState(data);
  }, []);

  return (
    <CVContext.Provider
      value={{
        cvData,
        setCvData,
        isLoading,
        setIsLoading,
        error,
        setError,
      }}
    >
      {children}
    </CVContext.Provider>
  );
}

export function useCV() {
  const context = useContext(CVContext);
  if (!context) {
    throw new Error("useCV must be used within a CVProvider");
  }
  return context;
}
