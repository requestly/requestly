import { CLIENT_MESSAGES } from "common/constants";
import { getRecord } from "common/storage";
import { AutoRecordingMode, SessionRecordingConfig, SourceKey, SourceOperator } from "common/types";
import { matchSourceUrl } from "./ruleMatcher";
import { injectWebAccessibleScript, isExtensionEnabled } from "./utils";
import config from "common/config";
import { tabService } from "../../external/tabService/tabService";
import { TAB_SERVICE_DATA } from "../../external/tabService/constants";

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

// const initSessionRecordingSDK = async (tabId: number, frameId: number) => {
//   await injectWebAccessibleScript("libs/requestly-web-sdk.js", {
//     tabId,
//     frameIds: [frameId],
//   });
// };

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

const startRecording = async (tabId: number, config: Record<string, any>) => {
  await injectWebAccessibleScript("libs/requestly-web-sdk.js", {
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
    tabService.removeData(tabId, TAB_SERVICE_DATA.SESSION_RECORDING);
  });

  if (openRecording) {
    watchRecording(tabId);
  }
};

export const startRecordingExplicitly = async (tab: chrome.tabs.Tab, showWidget: boolean = true) => {
  const sessionRecordingConfig = await getSessionRecordingConfig(tab.url);

  const sessionRecordingDataExist = !!tabService.getData(tab.id, TAB_SERVICE_DATA.SESSION_RECORDING);
  // Auto recording is on for current tab if sessionRecordingConfig exist,
  // so forcefully start explicit recording.
  if (!sessionRecordingConfig && sessionRecordingDataExist) {
    return;
  }

  const sessionRecordingData = { explicit: true, showWidget };

  startRecording(tab.id, sessionRecordingData);
};

export const launchUrlAndStartRecording = (url: string) => {
  chrome.tabs.create({ url }, (tab) => {
    tabService.setData(tab.id, TAB_SERVICE_DATA.SESSION_RECORDING, {
      notify: true,
      explicit: true,
      showWidget: true,
    });
  });
};

export const handleSessionRecordingOnClientPageLoad = async (tab: chrome.tabs.Tab, frameId: number) => {
  let sessionRecordingData = tabService.getData(tab.id, TAB_SERVICE_DATA.SESSION_RECORDING);

  if (!sessionRecordingData) {
    const sessionRecordingConfig = await getSessionRecordingConfig(tab.url);

    if (sessionRecordingConfig) {
      sessionRecordingData = { config: sessionRecordingConfig, url: tab.url };
      const recordingMode = sessionRecordingConfig?.autoRecording?.mode;

      sessionRecordingData.showWidget = recordingMode === "custom";

      if (recordingMode === "allPages") {
        sessionRecordingData.markRecordingIcon = false;
      }

      tabService.setData(tab.id, TAB_SERVICE_DATA.SESSION_RECORDING, sessionRecordingData);
    }
  } else if (!sessionRecordingData.explicit) {
    // stop recording if config was changed to turn off auto-recording for the session URL
    const sessionRecordingConfig = await getSessionRecordingConfig(sessionRecordingData.url);

    if (!sessionRecordingConfig) {
      stopRecording(tab.id, false);
      return;
    }
  }

  if (sessionRecordingData) {
    startRecording(tab.id, sessionRecordingData).then(() => {
      tabService.setData(tab.id, TAB_SERVICE_DATA.SESSION_RECORDING, {
        ...sessionRecordingData,
        notify: false,
        previousSession: null,
      });
    });
  }
};
