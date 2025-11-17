import { createContext, useContext } from "react";
import { ReactNode } from "react";

export interface GenericState {
  setTitle: (title: string) => void;
  setPreview: (preview: boolean) => void;
  setUnsaved: (unsaved: boolean) => void;
  setIcon: (icon: ReactNode) => void;
  getIsNew: () => boolean;
  getIsActive: () => boolean;
  addCloseBlocker: (topic: unknown, id: string, blocker: unknown) => void;
  removeCloseBlocker: (topic: unknown, id: string) => void;
  setIsNew: (isNewTab: boolean) => void;
  getSourceId: () => string | undefined;
  replace: (args: unknown) => void; // TODO: make type generic
  close: () => void;
}

const defaultGenericState: GenericState = {
  setTitle: () => {},
  setPreview: () => {},
  setUnsaved: () => {},
  setIcon: () => {},
  getIsNew: () => false,
  getIsActive: () => false,
  replace: () => {},
  close: () => {},
  addCloseBlocker: () => {},
  removeCloseBlocker: () => {},
  setIsNew: () => {},
  getSourceId: () => undefined,
};

/**
 * Should only contain setters where the consumer can have there own definition for it.
 */
export const GenericStateContext = createContext<GenericState>(defaultGenericState);

export const useGenericState = () => {
  return useContext(GenericStateContext);
};
