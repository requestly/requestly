import React from "react";
import { TabState } from "../store/tabStore";
import { StoreApi } from "zustand";
import { GenericStateContext } from "hooks/useGenericState";
import { useTabServiceStore } from "../store/tabServiceStore";

export const TabItem: React.FC<React.PropsWithChildren<{ store: StoreApi<TabState> }>> = React.memo((props) => {
  const incrementVersion = useTabServiceStore().use.incrementVersion();

  return (
    <GenericStateContext.Provider
      value={{
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
