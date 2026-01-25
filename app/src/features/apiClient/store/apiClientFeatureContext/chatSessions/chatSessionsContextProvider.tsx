import React, { createContext, useMemo } from "react";
import { ChatSessionsStore, createChatSessionsStore } from "./chatSessions.store";
import { AIChat } from "features/apiClient/components/AIChat";
import { StoreApi } from "zustand";

interface ChatSessionsContextProviderProps {
  sessions: AIChat.SessionsMap;
  children: React.ReactNode;
}

export const ChatSessionsStoreContext = createContext<StoreApi<ChatSessionsStore>>(null);

export const ChatSessionsContextProvider = ({ children, sessions }: ChatSessionsContextProviderProps) => {
  const store = useMemo(() => createChatSessionsStore(sessions), [sessions]);
  return <ChatSessionsStoreContext.Provider value={store}>{children}</ChatSessionsStoreContext.Provider>;
};
