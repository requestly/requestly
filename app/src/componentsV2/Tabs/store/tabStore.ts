import { create } from "zustand";

export type TabState = {
  id: number;
  source: any;
  saved: boolean;
  title: string;

  setTitle: (title: string) => void;
  setSaved: (saved: boolean) => void;
};

export const createTabStore = (id: number, source: any, title: string) => {
  return create<TabState>((set) => ({
    id,
    source,
    saved: false,
    title,

    setTitle: (title: string) => set({ title }),
    setSaved: (saved: boolean) => set({ saved }),
  }));
};
