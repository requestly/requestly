import { tabServiceStore } from "./store/tabServiceStore";
import { AbstractTabSource } from "./helpers/tabSource";

export const getTabServiceActions = () => {
  const resetTabs = (ignorePath?: boolean) => {
    tabServiceStore.getState().reset(ignorePath);
  };

  function closeTabsByContext(contextId?: string, skipUnsavedPrompt?: boolean) {
    tabServiceStore.getState().closeTabByContext(contextId, skipUnsavedPrompt);
  }

  function updateTabSource(sourceId: string, sourceName: string, fn: (source: AbstractTabSource) => AbstractTabSource) {
    tabServiceStore.getState().updateTabSource(sourceId, sourceName, fn);
  }

  return { resetTabs, closeTabsByContext, updateTabSource };
};
