/** Caution: Change at your own risk */
/** HOC to ensure that Outlet Component don't render the same route element again and again in different tabs */

import React from "react";

import { useTabsLayoutContext } from "layouts/TabsLayout";
import { useOutletContext } from "react-router-dom";

interface Props {
  children: React.ReactElement;
}

export const TabOutletHOC: React.FC<Props> = ({ children }) => {
  const outletContext: any = useOutletContext();

  const tab = outletContext?.tab;
  const { activeTab, tabOutletElementsMap } = useTabsLayoutContext();

  console.log("TEST", { tab, activeTab, outletContext, tabOutletElementsMap });

  let renderedOutletElement: React.ReactElement;

  if (!tab) {
    renderedOutletElement = children;
  } else if (activeTab?.id === tab?.id) {
    renderedOutletElement = tabOutletElementsMap.current?.[tab?.id]
      ? tabOutletElementsMap.current?.[tab?.id]
      : children;
    tabOutletElementsMap.current[tab.id] = renderedOutletElement;
  } else {
    renderedOutletElement = tabOutletElementsMap.current[tab.id];
  }
  return renderedOutletElement;
};
