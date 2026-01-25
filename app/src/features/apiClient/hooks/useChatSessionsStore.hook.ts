import { useContext } from "react";
import { ChatSessionsStoreContext } from "../store/apiClientFeatureContext/chatSessions/chatSessionsContextProvider";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { ChatSessionsStore } from "../store/apiClientFeatureContext/chatSessions/chatSessions.store";

export function useChatSessionsStore<T>(selector: (state: ChatSessionsStore) => T) {
  const store = useContext(ChatSessionsStoreContext);
  if (!store) {
    throw new Error("useChatSessionsStore must be used within ChatSessionsStoreProvider");
  }
  return useStore(store, useShallow(selector));
}
