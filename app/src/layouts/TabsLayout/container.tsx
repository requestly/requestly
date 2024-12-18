import React from "react";
import { TabsLayoutProvider } from "./contexts";
import { TabsLayoutContent } from "./components";
import { Feature } from "./contexts/tabsLayoutContext";

interface TabsLayoutContainerProps {
  /**
   * Unique id when its consumed, can be feature name.
   *
   * @example
   * "api-client"
   */
  id: Feature;
  children: React.ReactElement;
}

export const TabsLayoutContainer: React.FC<TabsLayoutContainerProps> & {
  TabsLayoutContent: typeof TabsLayoutContent;
} = ({ id, children }) => {
  return <TabsLayoutProvider id={id}>{children}</TabsLayoutProvider>;
};

TabsLayoutContainer.TabsLayoutContent = TabsLayoutContent;
