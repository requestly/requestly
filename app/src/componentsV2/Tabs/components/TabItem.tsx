import React from "react";
import { TabState } from "../store/tabStore";
import { StoreApi } from "zustand";

export const TabItem: React.FC<React.PropsWithChildren<{ store: StoreApi<TabState> }>> = React.memo((props) => {
  return <>{props.children}</>;
});
