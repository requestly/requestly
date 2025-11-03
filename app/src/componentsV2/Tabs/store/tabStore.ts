import { create } from "zustand";
import { AbstractTabSource } from "../helpers/tabSource";
import { ReactNode } from "react";
import { NativeError } from "errors/NativeError";
import { StoreApi } from "zustand";
import { EntryStoreState } from "../types";
import { getEmptyDraftApiRecord } from "features/apiClient/screens/apiClient/utils";
import { RQAPI } from "features/apiClient/types";

const createEntryStore = (entry: any): StoreApi<EntryStoreState> => {
  return create<EntryStoreState>((set) => ({
    entry,
    setEntry: (newEntry: any) => set({ entry: newEntry }),
  }));
};

export enum CloseTopic {
  UNSAVED_CHANGES = "unsaved_changes",
  COLLECTION_RUNNING = "collection_running",
}

type CloseBlockerDetails = {
  title: string;
  description?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
};

type CloseBlockerId = string;
export type ActiveBlocker = { id: CloseBlockerId; topic: CloseTopic; details: CloseBlockerDetails };

export type CloseBlocker = { canClose: true } | { canClose: false; details: CloseBlockerDetails };

export type TabState = {
  /** Tab id */
  id: number;
  source: AbstractTabSource;
  unsaved: boolean;
  preview: boolean;
  title: string;
  icon: ReactNode;
  closeBlockers: Map<CloseTopic, Map<CloseBlockerId, CloseBlocker>>;
  entryStore: StoreApi<EntryStoreState> | null;

  setTitle: (title: string) => void;
  setUnsaved: (saved: boolean) => void;
  setPreview: (preview: boolean) => void;
  setIcon: (icon: ReactNode) => void;
  setEntryStore: (store: StoreApi<EntryStoreState> | null) => void;

  canCloseTab: () => boolean;
  getActiveBlockers: () => ActiveBlocker[];
  getActiveBlocker: () => null | ActiveBlocker;
  addCloseBlocker: (topic: CloseTopic, id: CloseBlockerId, blocker: CloseBlocker) => void;
  removeCloseBlocker: (topic: CloseTopic, id: CloseBlockerId) => void;
  clearAllCloseBlockers: () => void;
};

export const createTabStore = (id: number, source: any, title: string, preview: boolean = false) => {
  const viewStore = source?.createViewStore();

  return create<TabState>((set, get) => ({
    id,
    title,
    source,
    preview,
    unsaved: false,
    icon: source.getIcon(),
    closeBlockers: new Map(),
    entryStore: viewStore,

    setTitle: (title: string) => set({ title }),
    setUnsaved: (unsaved: boolean) => set({ unsaved }),
    setPreview: (preview: boolean) => set({ preview }),
    setIcon: (icon: ReactNode) => set({ icon }),
    setEntryStore: (store: StoreApi<any> | null) => set({ entryStore: store }),

    canCloseTab: () => {
      const { closeBlockers } = get();

      for (const [, blockers] of closeBlockers) {
        for (const blocker of blockers.values()) {
          if (!blocker.canClose) {
            return false;
          }
        }
      }

      return true;
    },

    getActiveBlockers: () => {
      const { closeBlockers } = get();
      const activeBlockers: { topic: CloseTopic; id: string; details: CloseBlockerDetails }[] = [];

      Array.from(closeBlockers.entries()).forEach(([topic, blockerMap]) => {
        blockerMap.forEach((blocker, blockerId) => {
          if (blocker.canClose === false) {
            activeBlockers.push({ topic, id: blockerId, details: blocker.details });
          }
        });
      });

      return activeBlockers;
    },

    getActiveBlocker: () => {
      const activeBlockers = get().getActiveBlockers();
      return activeBlockers.length > 0 ? activeBlockers[0] : null;
    },

    addCloseBlocker: (topic: CloseTopic, id: string, blocker: CloseBlocker) => {
      const { closeBlockers } = get();
      const updatedBlockers = new Map(closeBlockers);

      if (!updatedBlockers.has(topic)) {
        updatedBlockers.set(topic, new Map());
      }

      const topicBlockers = new Map(updatedBlockers.get(topic));

      if (topicBlockers.has(id)) {
        throw new NativeError("Tab close blocker with the same id already exists").addContext({ topic, id, blocker });
      }

      topicBlockers.set(id, blocker);
      updatedBlockers.set(topic, topicBlockers);

      set({ closeBlockers: updatedBlockers });
    },

    removeCloseBlocker: (topic: CloseTopic, id: string) => {
      const { closeBlockers } = get();

      if (!closeBlockers.has(topic)) {
        return;
      }

      const updatedBlockers = new Map(closeBlockers);
      const topicBlockers = updatedBlockers.get(topic);

      if (!topicBlockers || !topicBlockers.has(id)) {
        return;
      }

      const updatedTopicBlockers = new Map(topicBlockers);
      updatedTopicBlockers.delete(id);

      if (updatedTopicBlockers.size === 0) {
        updatedBlockers.delete(topic);
      } else {
        updatedBlockers.set(topic, updatedTopicBlockers);
      }

      set({ closeBlockers: updatedBlockers });
    },

    clearAllCloseBlockers: () => {
      set({ closeBlockers: new Map() });
    },
  }));
};
