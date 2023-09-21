import { sendEventToBackground } from "../eventUtils";

export enum EVENT {
  EXTENSION_STATUS_TOGGLED = "extension_status_toggled",
  GROUP_TOGGLED = "group_toggled",
  OPEN_APP_CLICKED = "open_app_clicked",
  POPUP_OPENED = "popup_opened",
  POPUP_TAB_SELECTED = "popup_tab_selected",
  RULE_TOGGLED = "rule_toggled",
  START_RECORDING_CLICKED = "start_recording_clicked",
  STOP_RECORDING_CLICKED = "stop_recording_clicked",
  VIEW_RECORDING_CLICKED = "view_recording_clicked",
  EXTENSION_WATCH_DEMO_VIDEO_CLICKED = "extension_watch_demo_video_clicked",
  EXTENSION_RULE_CLICKED = "extension_rule_clicked",
  EXTENSION_VIEW_ALL_MODIFICATIONS_CLICKED = "extension_view_all_modifications_clicked",
}

export const sendEvent = (eventName: EVENT, eventParams: Record<string, any> = {}) => {
  eventParams["source"] = "popup";
  sendEventToBackground(eventName, eventParams);
};
