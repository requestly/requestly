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
  setUnsaved: (saved: boolean) => void;
  setPreview: (preview: boolean) => void;
};

export const createTabStore = (id: number, source: any, title: string, preview: boolean = false) => {
  return create<TabState>((set) => ({
    id,
    title,
    source,
    preview,
    unsaved: false,

    setTitle: (title) => set({ title }),
    setUnsaved: (unsaved) => set({ unsaved }),
    setPreview: (preview) => set({ preview }),
  }));
};
