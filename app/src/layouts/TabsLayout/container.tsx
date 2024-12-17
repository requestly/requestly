import React from "react";
import { TabsLayoutProvider } from "./contexts";
import { TabsLayoutContent } from "./components";
import { Feature } from "./contexts/tabsLayoutContext";

interface TabsLayoutContainerProps {
  children: React.ReactElement;
  childFeatureName: Feature;
}

export const TabsLayoutContainer: React.FC<TabsLayoutContainerProps> & {
  TabsLayoutContent: typeof TabsLayoutContent;
} = ({ children, childFeatureName }) => {
  return <TabsLayoutProvider childFeatureName={childFeatureName}>{children}</TabsLayoutProvider>;
};

TabsLayoutContainer.TabsLayoutContent = TabsLayoutContent;
