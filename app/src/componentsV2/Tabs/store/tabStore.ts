import { create } from "zustand";
import { AbstractTabSource } from "../helpers/tabSource";

export type TabState = {
  /** Tab id */
  id: number;
  source: AbstractTabSource;
  saved: boolean;
  preview: boolean;
  title: string;

  setTitle: (title: string) => void;
  setSaved: (saved: boolean) => void;
  setPreview: (preview: boolean) => void;
};

export const createTabStore = (id: number, source: any, title: string, preview: boolean = false) => {
  return create<TabState>((set) => ({
    id,
    title,
    source,
    preview,
    saved: false,

    setTitle: (title: string) => set({ title }),
    setSaved: (saved: boolean) => set({ saved }),
    setPreview: (preview: boolean) => set({ preview }),
  }));
};
