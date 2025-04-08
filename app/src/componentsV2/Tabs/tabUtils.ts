import PATHS from "config/constants/sub/paths";
import { tabServiceStore } from "./store/tabServiceStore";

export const navigate = (path: string) => {
  window.history.pushState({}, "", path);
};

export const getTabServiceActions = () => {
  const resetTabs = () => {
    tabServiceStore.getState().reset();
    navigate(PATHS.API_CLIENT.RELATIVE);
  };

  return { resetTabs };
};
