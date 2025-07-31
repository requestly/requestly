import { createContext, useContext } from "react";

export interface GenericState {
  setTitle: (title: string) => void;
  setPreview: (preview: boolean) => void;
  setUnsaved: (unsaved: boolean) => void;
  getIsNew: () => boolean;
  getIsActive: () => boolean;

  replace: (args: unknown) => void; // TODO: make type generic
  close: () => void;
}

const defaultGenericState: GenericState = {
  setTitle: () => {},
  setPreview: () => {},
  setUnsaved: () => {},
  getIsNew: () => false,
  getIsActive: () => false,
  replace: () => {},
  close: () => {},
};

/**
 * Should only contain setters where the consumer can have there own definition for it.
 */
export const GenericStateContext = createContext<GenericState>(defaultGenericState);

export const useGenericState = () => {
  return useContext(GenericStateContext);
};
