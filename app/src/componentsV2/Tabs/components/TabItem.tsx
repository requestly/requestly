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
        updateTitle: (title: string) => {
          props.store.getState().setTitle(title);
          incrementVersion();
        },
        updateUrl: (path: string) => {
          props.store.getState().source.setUrlPath(path);
          props.store.getState().source.updateUrl();
        },
      }}
    >
      {props.children}
    </GenericStateContext.Provider>
  );
});
