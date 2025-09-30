import { create } from "zustand";
import { AbstractTabSource } from "../helpers/tabSource";
import { ReactNode } from "react";

export enum CloseTopic {
  UNSAVED_CHANGES = "unsaved_changes",
  COLLECTION_RUNNING = "collection_running",
}

type CloseBlockerDetails = {
  title: string;
  description: string;
};

export type CloseBlocker = { canClose: true } | { canClose: false; details: CloseBlockerDetails };

export type TabState = {
  /** Tab id */
  id: number;
  source: AbstractTabSource;
  unsaved: boolean;
  preview: boolean;
  title: string;
  icon: ReactNode;
  closeBlockers: Map<CloseTopic, CloseBlocker>;

  setTitle: (title: string) => void;
  setUnsaved: (saved: boolean) => void;
  setPreview: (preview: boolean) => void;
  setIcon: (icon: ReactNode) => void;

  canCloseTab: () => boolean;
  getActiveBlockers: () => { topic: CloseTopic; details: CloseBlockerDetails }[];
  addCloseBlocker: (topic: CloseTopic, blocker: CloseBlocker) => void;
  removeCloseBlocker: (topic: CloseTopic) => void;
  clearAllCloseBlockers: () => void;
};

export const createTabStore = (id: number, source: any, title: string, preview: boolean = false) => {
  return create<TabState>((set, get) => ({
    id,
    title,
    source,
    preview,
    unsaved: false,
    icon: source.getIcon(),
    closeBlockers: new Map(),

    setTitle: (title: string) => set({ title }),
    setUnsaved: (unsaved: boolean) => set({ unsaved }),
    setPreview: (preview: boolean) => set({ preview }),
    setIcon: (icon: ReactNode) => set({ icon }),

    canCloseTab: () => {
      const { closeBlockers } = get();

      for (const [, blocker] of closeBlockers) {
        if (!blocker.canClose) {
          return false;
        }
      }

      return true;
    },

    getActiveBlockers: () => {
      const { closeBlockers } = get();
      const activeBlockers: { topic: CloseTopic; details: CloseBlockerDetails }[] = [];

      for (const [topic, blocker] of closeBlockers) {
        if (blocker.canClose === false) {
          activeBlockers.push({ topic, details: blocker.details });
        }
      }

      return activeBlockers;
    },

    addCloseBlocker: (topic: CloseTopic, blocker: CloseBlocker) => {
      const { closeBlockers } = get();
      const updatedBlockers = new Map(closeBlockers);
      updatedBlockers.set(topic, blocker);
      set({ closeBlockers: updatedBlockers });
    },

    removeCloseBlocker: (topic: CloseTopic) => {
      const { closeBlockers } = get();

      if (!closeBlockers.has(topic)) {
        return;
      }

      const updatedBlockers = new Map(closeBlockers);
      updatedBlockers.delete(topic);
      set({ closeBlockers: updatedBlockers });
    },

    clearAllCloseBlockers: () => {
      set({ closeBlockers: new Map() });
    },
  }));
};
