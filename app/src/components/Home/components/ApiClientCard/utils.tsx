import { TabServiceStore } from "componentsV2/Tabs/store/tabServiceStore";
import { AbstractTabSource } from "componentsV2/Tabs/helpers/tabSource";
import { CardListItem } from "../Card/types";

const formatContentList = (list: TabServiceStore["tabs"]) => {
  return Array.from((list as TabServiceStore["tabs"]).entries()).map(
    ([tabId, tabStore]): CardListItem => {
      const tabSource = tabStore.getState().source as AbstractTabSource;
      return {
        id: tabSource.metadata.id,
        title: tabSource.metadata.title,
        icon: tabSource.icon,
        url: tabSource.getUrlPath(),
        type: tabSource.type,
      };
    }
  );
};

export const getOptions = (list: TabServiceStore["tabs"]) => {
  const bodyTitle = "Recent Tabs";
  const contentList = formatContentList(list);
  return { bodyTitle, contentList };
};
