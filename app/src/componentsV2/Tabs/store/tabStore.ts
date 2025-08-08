import { create } from "zustand";
import { AbstractTabSource } from "../helpers/tabSource";
import { ReactNode } from "react";

export type TabState = {
  /** Tab id */
  id: number;
  source: AbstractTabSource;
  unsaved: boolean;
  preview: boolean;
  title: string;
  icon: ReactNode;

  setTitle: (title: string) => void;
  setUnsaved: (saved: boolean) => void;
  setPreview: (preview: boolean) => void;
  setIcon: (icon: ReactNode) => void;
};

export const createTabStore = (id: number, source: any, title: string, preview: boolean = false) => {
  return create<TabState>((set) => ({
    id,
    title,
    source,
    preview,
    unsaved: false,
    icon: source.getIcon(),

    setTitle: (title: string) => set({ title }),
    setUnsaved: (unsaved: boolean) => set({ unsaved }),
    setPreview: (preview: boolean) => set({ preview }),
    setIcon: (icon: ReactNode) => set({ icon }),
  }));
};
