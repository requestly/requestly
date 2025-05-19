import React from "react";
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
        close: () => {
          closeTabById(props.store.getState().id);
        },

        replace: (tabSource: TabState["source"]) => {
          upsertTabSource(props.store.getState().id, tabSource);
        },

        getIsNew: () => {
          return props.store.getState().source.getIsNewTab();
        },

        getIsActive: () => {
          return activeTabId === props.store.getState().id;
        },

        setTitle: (title: string) => {
          props.store.getState().setTitle(title);
          incrementVersion();
        },

        setPreview: (preview: boolean) => {
          props.store.getState().setPreview(preview);
          if (!preview) {
            resetPreviewTab();
          }
          incrementVersion();
        },

        setUnsaved: (unsaved: boolean) => {
          props.store.getState().setUnsaved(unsaved);
          incrementVersion();
        },
      }}
    >
      {props.children}
    </GenericStateContext.Provider>
  );
});
