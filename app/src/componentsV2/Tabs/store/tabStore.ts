import { create } from "zustand";
import { AbstractTabSource } from "../helpers/tabSource";

export type TabState = {
  /** Tab id */
  id: number;
  source: AbstractTabSource;
  unsaved: boolean;
  preview: boolean;
  title: string;

  setTitle: (title: string) => void;
  setUnSaved: (saved: boolean) => void;
  setPreview: (preview: boolean) => void;
};

export const createTabStore = (id: number, source: any, title: string, preview: boolean = false) => {
  return create<TabState>((set) => ({
    id,
    title,
    source,
    preview,
    unsaved: false,

    setTitle: (title: string) => set({ title }),
    setUnSaved: (unsaved: boolean) => set({ unsaved }),
    setPreview: (preview: boolean) => set({ preview }),
  }));
};
