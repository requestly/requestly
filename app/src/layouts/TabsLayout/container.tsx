import React from "react";
import { TabsLayoutProvider } from "./contexts";
import { TabsLayoutContent } from "./components";

interface TabsLayoutContainerProps {
  children: React.ReactElement;
}

export const TabsLayoutContainer: React.FC<TabsLayoutContainerProps> & {
  TabsLayoutContent: typeof TabsLayoutContent;
} = ({ children }) => {
  return <TabsLayoutProvider>{children}</TabsLayoutProvider>;
};

TabsLayoutContainer.TabsLayoutContent = TabsLayoutContent;
