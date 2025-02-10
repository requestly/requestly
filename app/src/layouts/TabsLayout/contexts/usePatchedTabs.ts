import { useMemo } from "react";
import { useSelector } from "react-redux";
import { TabsLayout } from "../types";
import { getActiveTab, getTabs } from "store/slices/tabs-layout";
import { isEmpty, isNull } from "lodash";

const isTabValid = (tab: TabsLayout.Tab) => tab.url !== undefined && tab.title !== undefined;

const patchUndefinedPropertyTabs = (tabs: TabsLayout.Tab[]) => {
  return tabs.filter((tab) => isTabValid(tab));
};

export const usePatchedTabs = (id: string) => {
  const tabs = useSelector(getTabs(id));
  const activeTab = useSelector(getActiveTab(id));

  const patchedTabs = useMemo(() => patchUndefinedPropertyTabs(tabs), [tabs]);

  const patchedActiveTab = useMemo(() => {
    if (isNull(activeTab)) return null;
    if (isTabValid(activeTab)) return activeTab;
    else {
      if (!isEmpty(patchedTabs)) return patchedTabs[0];
      else return null;
    }
  }, [activeTab, patchedTabs]);

  return { tabs: patchedTabs, activeTab: patchedActiveTab };
};
