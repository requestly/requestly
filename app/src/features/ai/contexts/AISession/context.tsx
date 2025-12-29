import React, { createContext, ReactNode, useContext, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export interface AISessionContextValue {
  sessionId: string | null;
  generationId: string | null;
  createNewAISession: () => string;
  startNewGeneration: () => string;
  endAISession: () => void;
  getCurrentGenerationId: () => string | null;
}

const AISessionContext = createContext<AISessionContextValue | undefined>(undefined);

interface AISessionProviderProps {
  children: ReactNode;
}

export const AISessionProvider: React.FC<AISessionProviderProps> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);

  // generationIdRef is used so async callbacks (like AI onFinish handlers) can always read
  // the latest generationId value instead of a stale one captured in closure.
  const generationIdRef = useRef<string | null>(null);

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
    generationIdRef.current = null;
  };

  const startNewGeneration = () => {
    const newGenerationId = uuidv4();
    setGenerationId(newGenerationId);
    generationIdRef.current = newGenerationId;
    return newGenerationId;
  };

  const getCurrentGenerationId = () => generationIdRef.current;

  const value = {
    sessionId,
    generationId,
    createNewAISession,
    startNewGeneration,
    endAISession,
    getCurrentGenerationId,
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
