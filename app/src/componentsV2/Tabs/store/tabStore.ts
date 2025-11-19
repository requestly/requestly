import { create } from "zustand";
import { AbstractTabSource } from "../helpers/tabSource";
import { ReactNode } from "react";
import { NativeError } from "errors/NativeError";

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
  isNewTab: boolean;

  setTitle: (title: string) => void;
  setUnsaved: (saved: boolean) => void;
  setPreview: (preview: boolean) => void;
  setIcon: (icon: ReactNode) => void;
  setIsNewTab: (isNewTab: boolean) => void;

  canCloseTab: () => boolean;
  getActiveBlockers: () => ActiveBlocker[];
  getActiveBlocker: () => null | ActiveBlocker;
  addCloseBlocker: (topic: CloseTopic, id: CloseBlockerId, blocker: CloseBlocker) => void;
  removeCloseBlocker: (topic: CloseTopic, id: CloseBlockerId) => void;
  clearAllCloseBlockers: () => void;
};

export const createTabStore = (
  id: number,
  source: any,
  title: string,
  preview = false,
  isNewTab = false
) => {
  return create<TabState>((set, get) => ({
    id,
    title,
    source,
    preview,
    unsaved: false,
    icon: source.getIcon(),
    closeBlockers: new Map(),
    isNewTab,

    setTitle: (title: string) => set({ title }),
    setUnsaved: (unsaved: boolean) => set({ unsaved }),
    setPreview: (preview: boolean) => set({ preview }),
    setIcon: (icon: ReactNode) => set({ icon }),
    setIsNewTab: (isNewTab: boolean) => set({ isNewTab }),

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
