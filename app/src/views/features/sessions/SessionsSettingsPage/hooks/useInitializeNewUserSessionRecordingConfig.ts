import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { AutoRecordingMode, SessionRecordingConfig } from "../../types";
import { defaultSessionRecordingConfig } from "../";
import { StorageService } from "init";
// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isExtensionInstalled, isExtensionVersionCompatible } from "actions/ExtensionActions";

export const useInitializeNewUserSessionRecordingConfig = () => {
  const appMode = useSelector(getAppMode);

  useEffect(() => {
    if (!isExtensionInstalled()) return;

    if (appMode !== GLOBAL_CONSTANTS.APP_MODES.EXTENSION) return;

    if (!isExtensionVersionCompatible("23.10.22")) return;

    StorageService(appMode)
      .getRecord(GLOBAL_CONSTANTS.STORAGE_KEYS.SESSION_RECORDING_CONFIG)
      .then((config) => {
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
