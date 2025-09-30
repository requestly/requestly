import { create } from "zustand";
import { AbstractTabSource } from "../helpers/tabSource";
import { ReactNode } from "react";

type IsTabClosable = { value: true } | { value: false; details: { title: string; description: string } };

export type TabState = {
  /** Tab id */
  id: number;
  source: AbstractTabSource;
  unsaved: boolean;
  preview: boolean;
  title: string;
  icon: ReactNode;
  isClosable: Set<IsTabClosable>;

  setTitle: (title: string) => void;
  setUnsaved: (saved: boolean) => void;
  setPreview: (preview: boolean) => void;
  setIcon: (icon: ReactNode) => void;
  addIsClosable: (instance: IsTabClosable) => void;
  removeIsClosable: (instance: IsTabClosable) => void;
};

export const createTabStore = (id: number, source: any, title: string, preview: boolean = false) => {
  return create<TabState>((set, get) => ({
    id,
    title,
    source,
    preview,
    unsaved: false,
    icon: source.getIcon(),
    isClosable: new Set(),

    setTitle: (title: string) => set({ title }),
    setUnsaved: (unsaved: boolean) => set({ unsaved }),
    setPreview: (preview: boolean) => set({ preview }),
    setIcon: (icon: ReactNode) => set({ icon }),
    addIsClosable: (instance) => {
      set((s) => {
        s.isClosable.add(instance);
        return { isClosable: new Set(s.isClosable) };
      });
    },

    removeIsClosable: (instance) => {
      const { isClosable } = get();
      if (!isClosable.has(instance)) {
        return;
      }

      isClosable.delete(instance);
      set({ isClosable: new Set(isClosable) });
    },
  }));
};
