import React, { createContext, useContext } from "react";

const ContextIdContext = createContext<string | null>(null);

export function ContextId(props: { id: string | null; children: React.ReactNode }) {
  return <ContextIdContext.Provider value={props.id}>{props.children}</ContextIdContext.Provider>;
}

export function useContextId() {
  const contextId = useContext(ContextIdContext);
  // The contextId can be null intermediately which has to be handled with "no context found" errors
  return contextId!; // Thats why marking it as non-nullable for types sake
}
