import { TabServiceStore } from "componentsV2/Tabs/store/tabServiceStore";
import { AbstractTabSource } from "componentsV2/Tabs/helpers/tabSource";

const formatContentList = (list: TabServiceStore["tabs"]) => {
  return Array.from((list as TabServiceStore["tabs"]).entries()).map(([tabId, tabStore]) => {
    return tabStore.getState().source as AbstractTabSource;
  });
};

export const getOptions = (list: TabServiceStore["tabs"]) => {
  const bodyTitle = "Recent Tabs";
  const contentList = formatContentList(list);
  return { bodyTitle, contentList };
};
