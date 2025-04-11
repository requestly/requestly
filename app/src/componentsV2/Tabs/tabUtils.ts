import { tabServiceStore } from "./store/tabServiceStore";
import { ResetTabSource } from "./analytics";

export const getTabServiceActions = () => {
  const resetTabs = (source: ResetTabSource) => {
    tabServiceStore.getState().reset(source);
  };

  return { resetTabs };
};
