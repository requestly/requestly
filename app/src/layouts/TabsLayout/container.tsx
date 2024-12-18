import React from "react";
import { TabsLayoutProvider } from "./contexts";
import { TabsLayoutContent } from "./components";

interface TabsLayoutContainerProps {
  id: string;
  children: React.ReactElement;
}

export const TabsLayoutContainer: React.FC<TabsLayoutContainerProps> & {
  TabsLayoutContent: typeof TabsLayoutContent;
} = ({ id, children }) => {
  return <TabsLayoutProvider id={id}>{children}</TabsLayoutProvider>;
};

TabsLayoutContainer.TabsLayoutContent = TabsLayoutContent;
