import React from "react";
import { TabState } from "../store/tabStore";
import { StoreApi } from "zustand";
import { GenericStateContext } from "hooks/useGenericState";
import { useTabService } from "../store/tabServiceStore";

export const TabItem: React.FC<React.PropsWithChildren<{ store: StoreApi<TabState> }>> = React.memo((props) => {
  const { incrementVersion } = useTabService();

  return (
    <GenericStateContext.Provider
      value={{
        setTitle: (title: string) => {
          props.store.getState().setTitle(title);
          incrementVersion();
        },
      }}
    >
      {props.children}
    </GenericStateContext.Provider>
  );
});
