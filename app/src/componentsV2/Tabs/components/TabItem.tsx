import React from "react";
import { TabState } from "../store/tabStore";
import { StoreApi } from "zustand";
import { GenericStateContext } from "hooks/useGenericState";
import { useTabServiceWithSelector } from "../store/tabServiceStore";
import {
  trackTabGenericStateSetPreviewMode,
  trackTabGenericStateSetSaved,
  trackTabGenericStateSetTitle,
} from "../analytics";

export const TabItem: React.FC<React.PropsWithChildren<{ store: StoreApi<TabState> }>> = React.memo((props) => {
  const [activeTabId, incrementVersion, resetPreviewTab, closeTabById, upsertTabSource] = useTabServiceWithSelector(
    (state) => [
      state.activeTabId,
      state.incrementVersion,
      state.resetPreviewTab,
      state.closeTabById,
      state.upsertTabSource,
    ]
  );

  const sourceId = props.store.getState().source.getSourceId();
  const sourceType = props.store.getState().source.type;

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
          trackTabGenericStateSetTitle(sourceId, sourceType);
          props.store.getState().setTitle(title);
          incrementVersion();
        },

        setPreview: (preview: boolean) => {
          trackTabGenericStateSetPreviewMode(sourceId, sourceType, preview);
          props.store.getState().setPreview(preview);
          if (!preview) {
            resetPreviewTab();
          }
          incrementVersion();
        },

        setUnSaved: (unsaved: boolean) => {
          trackTabGenericStateSetSaved(sourceId, sourceType, unsaved);
          props.store.getState().setUnSaved(unsaved);
          incrementVersion();
        },
      }}
    >
      {props.children}
    </GenericStateContext.Provider>
  );
});
