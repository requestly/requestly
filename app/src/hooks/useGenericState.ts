import { AbstractTabSource } from "componentsV2/Tabs/helpers/tabSource";
import { createContext, useContext } from "react";
import { ReactNode } from "react";

export interface GenericState {
  setTitle: (title: string) => void;
  setPreview: (preview: boolean) => void;
  setUnsaved: (unsaved: boolean) => void;
  setIcon: (icon: ReactNode) => void;
  getIsNew: () => boolean;
  getIsActive: () => boolean;

  replace: (args: unknown) => void; // TODO: make type generic
  replaceWithTabSource: (fn: (oldSource: AbstractTabSource) => AbstractTabSource) => void;
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
  replaceWithTabSource: () => {},
  close: () => {},
};

/**
 * Should only contain setters where the consumer can have there own definition for it.
 */
export const GenericStateContext = createContext<GenericState>(defaultGenericState);

export const useGenericState = () => {
  return useContext(GenericStateContext);
};
