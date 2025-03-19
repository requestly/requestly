import { create } from "zustand";
import { AbstractTabSource } from "../helpers/tabSource";

export type TabState = {
  id: number;
  sourceId: string;
  source: AbstractTabSource;
  saved: boolean;
  title: string;

  setTitle: (title: string) => void;
  setSaved: (saved: boolean) => void;
};

export const createTabStore = (id: number, source: AbstractTabSource, title: string) => {
  return create<TabState>((set) => ({
    id,
    sourceId: source.getSourceId(),
    source,
    saved: false,
    title,

    setTitle: (title: string) => set({ title }),
    setSaved: (saved: boolean) => set({ saved }),
  }));
};
