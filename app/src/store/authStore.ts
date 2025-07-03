import { create } from "zustand";

export type AuthStore = {
  version: number;
  increment: () => void;
};


const createAuthStore = () => {
  return create<AuthStore>()((set, get) => ({
    version: 0,

    increment() {
      set({
        version: get().version + 1,
      })
    },
  }));
};

export const useAuthState = createAuthStore();
