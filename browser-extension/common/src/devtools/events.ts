import { sendEventToBackground } from "../eventUtils";

export enum EVENT {
  DEVTOOL_OPENED = "devtool_opened",
  DEVTOOL_TAB_SELECTED = "devtool_tab_selected",
  RULE_CREATION_WORKFLOW_STARTED = "rule_creation_workflow_started",
}

export const sendEvent = (eventName: EVENT, eventParams: Record<string, any> = {}) => {
  eventParams["source"] = "devtool";
  sendEventToBackground(eventName, eventParams);
};
