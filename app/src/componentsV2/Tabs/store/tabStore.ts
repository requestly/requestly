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
  description: string;
  onCancel?: () => void;
  onConfirm?: () => void;
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
  closeBlockers: Map<CloseTopic, Map<string, CloseBlocker>>;

  setTitle: (title: string) => void;
  setUnsaved: (saved: boolean) => void;
  setPreview: (preview: boolean) => void;
  setIcon: (icon: ReactNode) => void;

  canCloseTab: () => boolean;
  getActiveBlockers: () => { topic: CloseTopic; id: string; details: CloseBlockerDetails }[];
  addCloseBlocker: (topic: CloseTopic, id: string, blocker: CloseBlocker) => void;
  removeCloseBlocker: (topic: CloseTopic, id: string) => void;
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

      return closeBlockers.keys().every((topic) => {
        return closeBlockers
          .get(topic)
          .values()
          .every((blocker) => blocker.canClose);
      });
    },

    getActiveBlockers: () => {
      const { closeBlockers } = get();
      const activeBlockers: { topic: CloseTopic; id: string; details: CloseBlockerDetails }[] = [];

      closeBlockers.entries().forEach(([topic, blockerMap]) => {
        blockerMap.forEach((blocker, blockerId) => {
          if (blocker.canClose === false) {
            activeBlockers.push({ topic, id: blockerId, details: blocker.details });
          }
        });
      });

      return activeBlockers;
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
