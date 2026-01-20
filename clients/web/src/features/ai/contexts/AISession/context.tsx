import React, { createContext, ReactNode, useContext, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface GenerationMetrics {
  totalProposedChanges: number;
  acceptedChanges: number;
}

export interface AISessionContextValue {
  sessionId: string | null;
  generationId: string | null;
  lastUsedQuery: string | null;
  lastGeneratedCode: string | null;
  generationMetrics: GenerationMetrics;
  updateGenerationMetrics: (key: keyof GenerationMetrics, value: number) => void;
  createNewAISession: () => string;
  startNewGeneration: () => string;
  endAISession: () => void;
  getCurrentGenerationId: () => string | null;
  setLastUsedQuery: (query: string) => void;
  setLastGeneratedCode: (code: string) => void;
  getReviewOutcome: () => "accept_all" | "reject_all" | "partial_accept";
}

const AISessionContext = createContext<AISessionContextValue | undefined>(undefined);

interface AISessionProviderProps {
  children: ReactNode;
}

export const AISessionProvider: React.FC<AISessionProviderProps> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [lastUsedQuery, setLastUsedQuery] = useState<string | null>(null);
  const [lastGeneratedCode, setLastGeneratedCode] = useState<string | null>(null);

  const generationMetricsRef = useRef<GenerationMetrics>({
    totalProposedChanges: 0,
    acceptedChanges: 0,
  });

  // generationIdRef is used so async callbacks (like AI onFinish handlers) can always read
  // the latest generationId value instead of a stale one captured in closure.
  const generationIdRef = useRef<string | null>(null);

  const updateGenerationMetrics = (key: keyof GenerationMetrics, value: number) => {
    generationMetricsRef.current[key] = value;
  };

  const createNewAISession = () => {
    if (sessionId) {
      return sessionId;
    }

    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    return newSessionId;
  };

  const endAISession = () => {
    setSessionId(null);
    setGenerationId(null);
    setLastUsedQuery(null);
    setLastGeneratedCode(null);
    generationIdRef.current = null;
    generationMetricsRef.current = {
      totalProposedChanges: 0,
      acceptedChanges: 0,
    };
  };

  const startNewGeneration = () => {
    const newGenerationId = uuidv4();
    setGenerationId(newGenerationId);
    generationIdRef.current = newGenerationId;
    return newGenerationId;
  };

  const getCurrentGenerationId = () => generationIdRef.current;

  const getReviewOutcome = () => {
    if (generationMetricsRef.current.acceptedChanges === generationMetricsRef.current.totalProposedChanges) {
      return "accept_all";
    } else if (generationMetricsRef.current.acceptedChanges === 0) {
      return "reject_all";
    } else {
      return "partial_accept";
    }
  };

  const value = {
    sessionId,
    generationId,
    lastUsedQuery,
    lastGeneratedCode,
    generationMetrics: generationMetricsRef.current,
    updateGenerationMetrics,
    createNewAISession,
    startNewGeneration,
    endAISession,
    getCurrentGenerationId,
    setLastUsedQuery,
    setLastGeneratedCode,
    getReviewOutcome,
  };

  return <AISessionContext.Provider value={value}>{children}</AISessionContext.Provider>;
};

export const useAISessionContext = (): AISessionContextValue => {
  const context = useContext(AISessionContext);

  if (context === undefined) {
    throw new Error("useAISessionContext must be used within an AISessionProvider");
  }

  return context;
};
