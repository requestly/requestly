import { ReactNode } from "react";
import { TabServiceStoreContext, tabServiceStoreWithAutoSelectors } from "./tabServiceStore";

export const TabServiceProvider = ({ children }: { children: ReactNode }) => {
  return (
    <TabServiceStoreContext.Provider value={tabServiceStoreWithAutoSelectors}>
      {children}
    </TabServiceStoreContext.Provider>
  );
};
