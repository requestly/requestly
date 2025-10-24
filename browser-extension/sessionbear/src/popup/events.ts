import { sendEventToBackground } from "../eventUtils";

export enum EVENT {
  EXTENSION_STATUS_TOGGLED = "extension_status_toggled",
  OPEN_APP_CLICKED = "open_app_clicked",
  POPUP_OPENED = "popup_opened",
  POPUP_TAB_SELECTED = "popup_tab_selected",
  START_RECORDING_CLICKED = "start_recording_clicked",
  STOP_RECORDING_CLICKED = "stop_recording_clicked",
  VIEW_RECORDING_CLICKED = "view_recording_clicked",
  SESSION_RECORDINGS_CONFIG_OPENED = "session_recordings_config_opened",
}

export const sendEvent = (eventName: EVENT, eventParams: Record<string, any> = {}) => {
  eventParams["source"] = "popup";
  sendEventToBackground(eventName, eventParams);
};
