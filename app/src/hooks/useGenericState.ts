import { createContext, useContext } from "react";

export interface GenericState {
  setTitle: (title: string) => void;
  setPreview: (preview: boolean) => void;
  setUnSaved: (unsaved: boolean) => void;
}

const defaultGenericState: GenericState = {
  setTitle: () => {},
  setPreview: () => {},
  setUnSaved: () => {},
};

/**
 * Should only contain setters where the consumer can have there own definition for it.
 */
export const GenericStateContext = createContext<GenericState>(defaultGenericState);

export const useGenericState = () => {
  return useContext(GenericStateContext);
};
