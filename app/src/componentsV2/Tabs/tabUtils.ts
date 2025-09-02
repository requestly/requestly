import { tabServiceStore } from "./store/tabServiceStore";

export const getTabServiceActions = () => {
  const resetTabs = (ignorePath?: boolean) => {
    tabServiceStore.getState().reset(ignorePath);
  };

  function closeTabsByContext(contextId?: string, skipUnsavedPrompt?: boolean) {
    tabServiceStore.getState().closeTabByContext(contextId, skipUnsavedPrompt);
  }

  return { resetTabs, closeTabsByContext };
};
