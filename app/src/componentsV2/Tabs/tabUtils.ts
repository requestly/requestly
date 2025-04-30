import { tabServiceStore } from "./store/tabServiceStore";

export const getTabServiceActions = () => {
  const resetTabs = () => {
    tabServiceStore.getState().reset();
  };

  return { resetTabs };
};
