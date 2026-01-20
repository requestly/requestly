import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { AutoRecordingMode, SessionRecordingConfig } from "features/sessionBook";
import { defaultSessionRecordingConfig } from "..";
import { StorageService } from "init";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { isExtensionInstalled, isExtensionVersionCompatible } from "actions/ExtensionActions";
import clientSessionRecordingStorageService from "services/clientStorageService/features/session-recording";

export const useInitializeNewUserSessionRecordingConfig = () => {
  const appMode = useSelector(getAppMode);

  useEffect(() => {
    if (!isExtensionInstalled()) return;

    if (appMode !== GLOBAL_CONSTANTS.APP_MODES.EXTENSION) return;

    if (!isExtensionVersionCompatible("23.10.22")) return;

    clientSessionRecordingStorageService.getSessionRecordingConfig().then((config) => {
      if (!config || Object.keys(config).length === 0) {
        const newUserRecordingConfig: SessionRecordingConfig = {
          ...defaultSessionRecordingConfig,
          autoRecording: {
            ...defaultSessionRecordingConfig.autoRecording,
            isActive: true,
            mode: AutoRecordingMode.ALL_PAGES,
          },
        };

        StorageService(appMode).saveSessionRecordingPageConfig(newUserRecordingConfig);
      }
    });
  }, [appMode]);
};
