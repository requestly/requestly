import React from "react";
import { TabState } from "../store/tabStore";
import { StoreApi } from "zustand";
import { GenericStateContext } from "hooks/useGenericState";
import { useTabServiceStore } from "../store/tabServiceStore";
import { updateUrlPath } from "../utils";

export const TabItem: React.FC<React.PropsWithChildren<{ store: StoreApi<TabState> }>> = React.memo((props) => {
  const incrementVersion = useTabServiceStore().use.incrementVersion();

  return (
    <GenericStateContext.Provider
      value={{
        setTitle: (title: string) => {
          props.store.getState().setTitle(title);
          incrementVersion();
        },
        setUrl: (path: string) => {
          props.store.getState().source.setUrlPath(path);
          updateUrlPath(path);
        },
      }}
    >
      {props.children}
    </GenericStateContext.Provider>
  );
});
