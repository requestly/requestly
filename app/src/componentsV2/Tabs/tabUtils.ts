import PATHS from "config/constants/sub/paths";
import { tabServiceStore } from "./store/tabServiceStore";
import { ResetTabSource } from "./analytics";

export const navigate = (path: string) => {
  window.history.pushState({}, "", path);
};

export const getTabServiceActions = () => {
  const resetTabs = (source: ResetTabSource) => {
    tabServiceStore.getState().reset(source);
    navigate(PATHS.API_CLIENT.RELATIVE);
  };

  return { resetTabs };
};
