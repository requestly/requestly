import { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { tabsActions, tabsAdapter } from "./slice";
import { ActiveWorkflow, TabId } from "./types";
import { RootState } from "store/types";
import { reduxStore } from "store";
import { selectTabsByEntityType } from "./selectors";
import { EntityType } from "features/apiClient/slices/types";
import { useHostContext } from "hooks/useHostContext";

const tabsSelectors = tabsAdapter.getSelectors<RootState>((state) => state.tabs.tabs);

export const useTabs = () => {
  return useSelector(tabsSelectors.selectAll);
};

export const useTabById = (id: TabId | undefined) => {
  return useSelector((state: RootState) => (id ? tabsSelectors.selectById(state, id) : undefined));
};

export const useActiveTab = () => {
  const activeTabId = useSelector((state: RootState) => state.tabs.activeTabId);
  return useTabById(activeTabId);
};

export const usePreviewTab = () => {
  const previewTabId = useSelector((state: RootState) => state.tabs.previewTabId);
  return useTabById(previewTabId);
};

export function useTabsByEntityType(entityType: EntityType) {
  return useSelector((state: RootState) => selectTabsByEntityType(state, entityType));
}

export function useWorkflowManager() {
  const registerWorkflow = useCallback((tabId: TabId, workflow: ActiveWorkflow) => {
    reduxStore.dispatch(tabsActions.addActiveWorkflow({ tabId, workflow }));
  }, []);

  const unregisterWorkflow = useCallback((tabId: TabId, workflow: ActiveWorkflow) => {
    reduxStore.dispatch(tabsActions.removeActiveWorkflow({ tabId, workflow }));
  }, []);

  return {
    registerWorkflow,
    unregisterWorkflow,
  };
}

export function useActiveWorkflow(activeWorkflow: ActiveWorkflow) {
  const { registerWorkflow, unregisterWorkflow } = useHostContext();

  useEffect(() => {
    registerWorkflow(activeWorkflow);

    return () => {
      unregisterWorkflow(activeWorkflow);
    };
  }, [activeWorkflow, registerWorkflow, unregisterWorkflow]);

  return activeWorkflow.workflow;
}
