import { TabsLayout } from "../../types";
import { tabIcons } from "./constants";

const getIconTypeFromTabUrl = (url: string) => {
  if (url.includes("request")) {
    return TabsLayout.IconType.REQUEST;
  } else if (url.includes("collection")) {
    return TabsLayout.IconType.COLLECTION;
  } else if (url.includes("environments")) {
    return TabsLayout.IconType.ENVIORNMENT_VARIABLE;
  } else if (url.includes("history")) {
    return TabsLayout.IconType.HISTORY;
  }
};

const getTabIcon = (iconType: TabsLayout.IconType) => {
  return tabIcons[iconType] ?? null;
};

export const getTabIconFromUrl = (url: string) => {
  const iconType = getIconTypeFromTabUrl(url);
  return getTabIcon(iconType);
};
