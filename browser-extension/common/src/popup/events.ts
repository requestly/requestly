import { sendEventToBackground } from "../eventUtils";

export enum EVENT {
  EXTENSION_STATUS_TOGGLED = "status_toggled",
  GROUP_TOGGLED = "group_toggled",
  OPEN_APP_CLICKED = "open_app_clicked",
  POPUP_OPENED = "popup_opened",
  POPUP_TAB_SELECTED = "popup_tab_selected",
  RULE_TOGGLED = "rule_toggled",
  START_RECORDING_CLICKED = "start_recording_clicked",
  STOP_RECORDING_CLICKED = "stop_recording_clicked",
  VIEW_RECORDING_CLICKED = "view_recording_clicked",
  WATCH_DEMO_VIDEO_CLICKED = "watch_demo_video_clicked",
}

export const sendEvent = (eventName: EVENT, eventParams: Record<string, any> = {}) => {
  eventParams["source"] = "popup";
  sendEventToBackground(eventName, eventParams);
};
