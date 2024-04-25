import { CLIENT_MESSAGES } from "common/constants";
import { getRecord } from "common/storage";
import { AutoRecordingMode, SessionRecordingConfig, SourceKey, SourceOperator } from "common/types";
import { matchSourceUrl } from "./ruleMatcher";
import { injectWebAccessibleScript, isExtensionEnabled } from "./utils";
import config from "common/config";

const CONFIG_STORAGE_KEY = "sessionRecordingConfig";

const getSessionRecordingConfig = async (url: string): Promise<SessionRecordingConfig> => {
  const sessionRecordingConfig = await getRecord<SessionRecordingConfig>(CONFIG_STORAGE_KEY);

  if (!sessionRecordingConfig) {
    return null;
  }

  let pageSources = sessionRecordingConfig?.pageSources || [];

  if (await isExtensionEnabled()) {
    if ("autoRecording" in sessionRecordingConfig) {
      if (!sessionRecordingConfig?.autoRecording.isActive) {
        return null;
      } else if (sessionRecordingConfig?.autoRecording.mode === AutoRecordingMode.ALL_PAGES) {
        pageSources = [
          {
            value: "*",
            key: SourceKey.URL,
            isActive: true,
            operator: SourceOperator.WILDCARD_MATCHES,
          },
        ];
      }
    }

    if (pageSources.some((pageSource) => matchSourceUrl(pageSource, url))) {
      return sessionRecordingConfig;
    }
  }

  return null;
};

export const initSessionRecording = async (tabId: number, frameId: number, url: string) => {
  const config = await getSessionRecordingConfig(url);

  if (config) {
    await injectWebAccessibleScript("libs/requestly-web-sdk.js", {
      tabId,
      frameIds: [frameId],
    });
  }

  return config;
};

export const onSessionRecordingStartedNotification = (tabId: number, markIcon: boolean) => {
  if (markIcon) {
    chrome.action.setBadgeText({ tabId, text: "REC" });
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#e34850" });
  }
};

export const onSessionRecordingStoppedNotification = (tabId: number) => {
  chrome.action.setBadgeText({ tabId, text: "" });
};

export const getTabSession = (tabId: number, callback: () => void) => {
  chrome.tabs.sendMessage(
    tabId,
    { action: CLIENT_MESSAGES.GET_TAB_SESSION },
    { frameId: 0 }, // top frame
    callback
  );
};

export const watchRecording = (tabId: number) => {
  chrome.tabs.create({ url: `${config.WEB_URL}/sessions/draft/${tabId}` });
};

const startRecording = (tabId: number, config: Record<string, any>) => {
  injectWebAccessibleScript("libs/requestly-web-sdk.js", {
    tabId: tabId,
  }).then(() => {
    chrome.tabs.sendMessage(tabId, {
      action: CLIENT_MESSAGES.START_RECORDING,
      payload: config,
    });
  });
};

export const stopRecording = (tabId: number, openRecording: boolean) => {
  chrome.tabs.sendMessage(tabId, { action: CLIENT_MESSAGES.STOP_RECORDING }).then(() => {
    if (openRecording) {
      watchRecording(tabId);
    }
  });
};

export const startRecordingExplicitly = async (tab: chrome.tabs.Tab, showWidget: boolean) => {
  const sessionRecordingData = { explicit: true, showWidget };

  startRecording(tab.id, sessionRecordingData);
};

export const launchUrlAndStartRecording = (url: string) => {
  chrome.tabs.create({ url }, (tab) => {
    startRecording(tab.id, { explicit: true, notify: true });
  });
};
