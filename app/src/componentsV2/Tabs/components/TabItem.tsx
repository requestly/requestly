import React, { useCallback } from "react";
import { HostContextImpl } from "hooks/useHostContext";
import { useDispatch } from "react-redux";
import { closeTab } from "../slice/thunks";
import { tabsActions } from "../slice/slice";
import { useIsActiveTab, useTabById } from "../slice/hooks";
import { TabSource } from "../types";
import { TabId, ActiveWorkflow } from "../slice/types";

export const TabItem: React.FC<React.PropsWithChildren<{ tabId: TabId }>> = React.memo((props) => {
  const dispatch = useDispatch();
  const tab = useTabById(props.tabId);
  const isActive = useIsActiveTab(props.tabId);

  return (
    <HostContextImpl.Provider
      value={{
        close: useCallback(() => {
          dispatch(closeTab({ tabId: props.tabId }) as any);
        }, [dispatch, props.tabId]),

        replace: useCallback(
          (source: TabSource) => {
            dispatch(tabsActions.updateTab({ tabId: props.tabId, source, modeConfig: tab.modeConfig }));
          },
          [dispatch, props.tabId, tab]
        ),

        getIsActive: useCallback(() => {
          return isActive;
        }, [isActive]),

        getSourceId: useCallback(() => {
          return tab.source.getSourceId();
        }, [tab]),

        getBufferId: useCallback(() => {
          if (tab.modeConfig.mode === "buffer") {
            return tab.modeConfig.entityId;
          }
        }, [tab]),

        registerWorkflow: useCallback(
          (w: ActiveWorkflow) => {
            dispatch(tabsActions.addActiveWorkflow({ tabId: props.tabId, workflow: w }));

            w.workflow.then(() => {
              dispatch(tabsActions.removeActiveWorkflow({ tabId: props.tabId, workflow: w }));
            });

            w.workflow.catch(() => {
              dispatch(tabsActions.removeActiveWorkflow({ tabId: props.tabId, workflow: w }));
            });

            return w;
          },
          [props.tabId, dispatch]
        ),

        registerSecondaryBuffer: useCallback(
          (bufferId: string) => {
            dispatch(tabsActions.registerSecondaryBuffer({ tabId: props.tabId, bufferId }));
          },
          [props.tabId, dispatch]
        ),

        unregisterSecondaryBuffer: useCallback(
          (bufferId: string) => {
            dispatch(tabsActions.unregisterSecondaryBuffer({ tabId: props.tabId, bufferId }));
          },
          [props.tabId, dispatch]
        ),
      }}
    >
      {props.children}
    </HostContextImpl.Provider>
  );
});
