import { create } from "zustand";
import { AbstractTabSource } from "../helpers/tabSource";
import { ReactNode } from "react";

export enum CloseTopic {
  UNSAVED_CHANGES = "unsaved_changes",
  COLLECTION_RUNNING = "collection_running",
}

export type Closable = { value: true } | { value: false; details: { title: string; description: string } };

export type TabState = {
  /** Tab id */
  id: number;
  source: AbstractTabSource;
  unsaved: boolean;
  preview: boolean;
  title: string;
  icon: ReactNode;
  closable: Map<CloseTopic, Closable>;

  setTitle: (title: string) => void;
  setUnsaved: (saved: boolean) => void;
  setPreview: (preview: boolean) => void;
  setIcon: (icon: ReactNode) => void;
  isTabClosable: () => boolean;
  addInClosable: (topic: CloseTopic, instance: Closable) => void;
  removeFromClosable: (topic: CloseTopic) => void;
};

export const createTabStore = (id: number, source: any, title: string, preview: boolean = false) => {
  return create<TabState>((set, get) => ({
    id,
    title,
    source,
    preview,
    unsaved: false,
    icon: source.getIcon(),
    closable: new Map(),

    setTitle: (title: string) => set({ title }),
    setUnsaved: (unsaved: boolean) => set({ unsaved }),
    setPreview: (preview: boolean) => set({ preview }),
    setIcon: (icon: ReactNode) => set({ icon }),
    isTabClosable: () => {
      const { closable } = get();
      for (const [, instance] of closable) {
        if (instance.value === false) {
          return false;
        }
      }
      return true;
    },

    addInClosable: (topic, instance) => {
      const { closable } = get();
      const updatedClosableMap = new Map(closable);
      updatedClosableMap.set(topic, instance);
      set({ closable: updatedClosableMap });
    },

    removeFromClosable: (topic) => {
      const { closable } = get();
      if (!closable.has(topic)) {
        return;
      }

      const updatedClosableMap = new Map(closable);
      updatedClosableMap.delete(topic);
      set({ closable: updatedClosableMap });
    },
  }));
};
