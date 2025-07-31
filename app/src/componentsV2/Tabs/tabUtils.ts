import { tabServiceStore } from "./store/tabServiceStore";

export const getTabServiceActions = () => {
  const resetTabs = (ignorePath?: boolean) => {
    tabServiceStore.getState().reset(ignorePath);
  };

  return { resetTabs };
};
