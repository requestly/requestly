import { EntryStoreState } from "componentsV2/Tabs/types";
import { createContext, useContext } from "react";
import { ReactNode } from "react";
import { StoreApi } from "zustand";

export interface GenericState {
  entryStore: StoreApi<any> | null;
  setEntryStore: (store: StoreApi<EntryStoreState> | null) => void;
  setTitle: (title: string) => void;
  setPreview: (preview: boolean) => void;
  setUnsaved: (unsaved: boolean) => void;
  setIcon: (icon: ReactNode) => void;
  getIsNew: () => boolean;
  getIsActive: () => boolean;
  addCloseBlocker: (topic: unknown, id: string, blocker: unknown) => void;
  removeCloseBlocker: (topic: unknown, id: string) => void;

  replace: (args: unknown) => void; // TODO: make type generic
  close: () => void;
}

const defaultGenericState: GenericState = {
  entryStore: null,
  setEntryStore: () => {},
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
};

/**
 * Should only contain setters where the consumer can have there own definition for it.
 */
export const GenericStateContext = createContext<GenericState>(defaultGenericState);

export const useGenericState = () => {
  return useContext(GenericStateContext);
};
