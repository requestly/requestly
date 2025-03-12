import React from "react";
import { TabState } from "../store/tabStore";

export const TabItem: React.FC<React.PropsWithChildren<{ store: TabState }>> = React.memo((props) => {
  return <>{props.children}</>;
});
