import { CLIENT_MESSAGES } from "common/constants";
import { getRecord, saveRecord } from "common/storage";
import { AutoRecordingMode, SessionRecordingConfig, SourceKey, SourceOperator } from "common/types";
import { matchSourceUrl } from "./ruleMatcher";
import { injectWebAccessibleScript, isExtensionEnabled } from "./utils";

const CONFIG_STORAGE_KEY = "sessionRecordingConfig";

const getSessionRecordingConfig = async (url: string): Promise<SessionRecordingConfig> => {
  const sessionRecordingConfig = await getRecord<SessionRecordingConfig>(CONFIG_STORAGE_KEY);
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

export const initSessionRecording = async (
  tabId: number,
  frameId: number,
  url: string,
  setNewConfig: boolean = false
) => {
  if (setNewConfig) {
    const newPageSource = {
      key: SourceKey.HOST,
      operator: SourceOperator.CONTAINS,
      value: new URL(url).hostname,
    };
    const sessionRecordingConfig = await getRecord<SessionRecordingConfig>(CONFIG_STORAGE_KEY);
    const pageSources = sessionRecordingConfig?.pageSources || [];

    await saveRecord(CONFIG_STORAGE_KEY, {
      ...sessionRecordingConfig,
      pageSources: [newPageSource, ...pageSources],
    });
  }
  const config = await getSessionRecordingConfig(url);

  if (config) {
    await injectWebAccessibleScript("libs/requestly-web-sdk.js", {
      tabId,
      frameIds: [frameId],
    });
  }

  return config;
};

export const onSessionRecordingStartedNotification = (tabId: number) => {
  chrome.action.setBadgeText({ tabId, text: "REC" });
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#e34850" });
};

export const getTabSession = (tabId: number, callback: () => void) => {
  chrome.tabs.sendMessage(
    tabId,
    { action: CLIENT_MESSAGES.GET_TAB_SESSION },
    { frameId: 0 }, // top frame
    callback
  );
};
