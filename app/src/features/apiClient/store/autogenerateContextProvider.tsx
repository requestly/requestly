import { createContext, ReactNode, useState } from "react";
import { StoreApi } from "zustand";
import { AutogeneratedFieldsStore, createAutogeneratedStore } from "./autogenerateStore";

export const AutogenerateStoreContext = createContext<StoreApi<AutogeneratedFieldsStore>>(null);

export const AutogenerateProvider = ({ children }: { children: ReactNode }) => {
  const [store] = useState(() => createAutogeneratedStore());
  return <AutogenerateStoreContext.Provider value={store}>{children}</AutogenerateStoreContext.Provider>;
};
