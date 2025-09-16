import React, { useCallback } from "react";
import { TabState } from "../store/tabStore";
import { StoreApi } from "zustand";
import { GenericStateContext } from "hooks/useGenericState";
import { useTabServiceWithSelector } from "../store/tabServiceStore";

export const TabItem: React.FC<React.PropsWithChildren<{ store: StoreApi<TabState> }>> = React.memo((props) => {
  const [
    activeTabId,
    incrementVersion,
    resetPreviewTab,
    closeTabById,
    upsertTabSource,
  ] = useTabServiceWithSelector((state) => [
    state.activeTabId,
    state.incrementVersion,
    state.resetPreviewTab,
    state.closeTabById,
    state.upsertTabSource,
  ]);

  return (
    <GenericStateContext.Provider
      value={{
        close: useCallback(() => {
          closeTabById(props.store.getState().id);
        }, [closeTabById, props.store]),

        replace: useCallback(
          (tabSource: TabState["source"]) => {
            upsertTabSource(props.store.getState().id, tabSource);
          },
          [props.store, upsertTabSource]
        ),
       
        getIsNew: useCallback(() => {
          return props.store.getState().source.getIsNewTab();
        }, [props.store]),

        getIsActive: useCallback(() => {
          return activeTabId === props.store.getState().id;
        }, [activeTabId, props.store]),

        setTitle: useCallback(
          (title: string) => {
            props.store.getState().setTitle(title);
            incrementVersion();
          },
          [incrementVersion, props.store]
        ),

        setIcon: useCallback(
          (icon: React.ReactNode) => {
            props.store.getState().setIcon(icon);
            incrementVersion();
          },
          [incrementVersion, props.store]
        ),

        setPreview: useCallback(
          (preview: boolean) => {
            props.store.getState().setPreview(preview);
            if (!preview) {
              resetPreviewTab();
            }
            incrementVersion();
          },
          [props.store, incrementVersion, resetPreviewTab]
        ),

        setUnsaved: useCallback(
          (unsaved: boolean) => {
            props.store.getState().setUnsaved(unsaved);
            incrementVersion();
          },
          [incrementVersion, props.store]
        ),
      }}
    >
      {props.children}
    </GenericStateContext.Provider>
  );
});
