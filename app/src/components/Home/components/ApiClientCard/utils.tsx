import { TabState } from "componentsV2/Tabs/slice/types";
import { AbstractTabSource } from "componentsV2/Tabs/helpers/tabSource";
import { CardListItem } from "../Card/types";

const formatContentList = (list: TabState[]) => {
  return list.map((tabState): CardListItem => {
    const tabSource = tabState.source as AbstractTabSource;
    return {
      id: tabSource.metadata.id,
      title: tabSource.metadata.title,
      icon: tabSource.getIcon(),
      url: tabSource.getUrlPath(),
      type: tabSource.type,
    };
  });
};

export const getOptions = (list: TabState[]) => {
  const bodyTitle = "Recent Tabs";
  const contentList = formatContentList(list);
  return { bodyTitle, contentList };
};
