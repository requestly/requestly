import { createContext, useContext } from "react";
import { TabSource } from "componentsV2/Tabs/types";
import { ActiveWorkflow } from "componentsV2/Tabs/slice/types";

export interface HostContext {
  close: () => void;
  replace: (source: TabSource) => void;

  getIsActive: () => boolean;
  getSourceId: () => string | undefined;

  registerWorkflow: (workflow: ActiveWorkflow) => void;
  unregisterWorkflow: (workflow: ActiveWorkflow) => void;
}

const defaultHostContext: HostContext = {
  close: () => {},
  replace: () => {},
  getIsActive: () => false,
  getSourceId: () => undefined,
  registerWorkflow: () => {},
  unregisterWorkflow: () => {},
};

export const HostContextImpl = createContext<HostContext>(defaultHostContext);

export const useHostContext = () => {
  return useContext(HostContextImpl);
};
