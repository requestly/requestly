import React from "react";
import { TabState } from "../store/tabStore";
import { StoreApi } from "zustand";
import { GenericStateContext } from "hooks/useGenericState";
import { useTabServiceWithSelector } from "../store/tabServiceStore";

export const TabItem: React.FC<React.PropsWithChildren<{ store: StoreApi<TabState> }>> = React.memo((props) => {
  const [incrementVersion, activeTabId] = useTabServiceWithSelector((state) => [
    state.incrementVersion,
    state.activeTabId,
  ]);

  return (
    <GenericStateContext.Provider
      value={{
        activeTabId: activeTabId,
        tabId: props.store.getState().id,
        sourceId: props.store.getState().source.metadata.id,
        isNewTab: props.store.getState().source.getIsNewTab(),

        setTitle: (title: string) => {
          props.store.getState().setTitle(title);
          incrementVersion();
        },

        setPreview: (preview: boolean) => {
          props.store.getState().setPreview(preview);
          incrementVersion();
        },

        setSaved: (saved: boolean) => {
          props.store.getState().setSaved(saved);
          incrementVersion();
        },
      }}
    >
      {props.children}
    </GenericStateContext.Provider>
  );
});
