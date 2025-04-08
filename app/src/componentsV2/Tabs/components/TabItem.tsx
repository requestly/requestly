import React from "react";
import { TabState } from "../store/tabStore";
import { StoreApi } from "zustand";
import { GenericStateContext } from "hooks/useGenericState";
import { useTabServiceWithSelector } from "../store/tabServiceStore";

export const TabItem: React.FC<React.PropsWithChildren<{ store: StoreApi<TabState> }>> = React.memo((props) => {
  const [incrementVersion, resetPreviewTab] = useTabServiceWithSelector((state) => [
    state.incrementVersion,
    state.resetPreviewTab,
  ]);

  return (
    <GenericStateContext.Provider
      value={{
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

        setUnSaved: (unsaved: boolean) => {
          props.store.getState().setUnSaved(unsaved);
          incrementVersion();
        },
      }}
    >
      {props.children}
    </GenericStateContext.Provider>
  );
});
