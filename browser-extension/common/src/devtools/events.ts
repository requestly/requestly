import { sendEventToBackground } from "../eventUtils";

export enum EVENT {
  DEVTOOL_OPENED = "devtool_opened",
  DEVTOOL_TAB_SELECTED = "devtool_tab_selected",
}

export const sendEvent = (eventName: EVENT, eventParams: Record<string, any> = {}) => {
  eventParams["source"] = "devtool";
  sendEventToBackground(eventName, eventParams);
};
