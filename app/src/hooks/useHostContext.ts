import { createContext, useContext } from "react";
import { TabSource } from "componentsV2/Tabs/types";
import { ActiveWorkflow } from "componentsV2/Tabs/slice/types";
import { NativeError } from "errors/NativeError";

export interface HostContext {
  close: () => void;
  replace: (source: TabSource) => void;

  getIsActive: () => boolean;
  getSourceId: () => string | undefined;
  getBufferId: () => string | undefined;

  registerWorkflow: (workflow: ActiveWorkflow) => void;
  registerSecondaryBuffer: (bufferId: string) => void;
  unregisterSecondaryBuffer: (bufferId: string) => void;
}

export const HostContextImpl = createContext<HostContext | null>(null);

export const useHostContext = () => {
  const context = useContext(HostContextImpl);

  if (!context) {
    throw new NativeError("useHostContext must be used within a 'HostContext.Provider' component.");
  }

  return context;
};

HostContextImpl.displayName = "HostContext";
