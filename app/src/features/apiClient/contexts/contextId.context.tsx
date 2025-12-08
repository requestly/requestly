import React, { createContext, useContext } from "react";

const ContextIdContext = createContext<string | null>(null);

export function ContextId(props: { id: string | null; children: React.ReactNode }) {
  return <ContextIdContext.Provider value={props.id}>{props.children}</ContextIdContext.Provider>;
}

export function useContextId() {
  const contextId = useContext(ContextIdContext);
  return contextId;
}
