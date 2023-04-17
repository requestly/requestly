import { sendEventToBackground } from "../eventUtils";

export enum EVENT {
  POPUP_OPENED = "popup_opened",
  OPEN_APP_CLICKED = "open_app_clicked",
  RULE_TOGGLED = "rule_toggled",
}

export const sendEvent = (eventName: EVENT, eventParams: Record<string, any> = {}) => {
  eventParams["source"] = "popup";
  sendEventToBackground(eventName, eventParams);
};
