import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getAppMode, getExtensionInstallDate } from "store/selectors";
import { dateStringToEpoch } from "utils/DateTimeUtils";
import { AutoRecordingMode, SessionRecordingConfig } from "../../types";
import { defaultSessionRecordingConfig } from "../";
import { StorageService } from "init";
// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

export const useInitializeNewUserSessionConfig = () => {
  const appMode = useSelector(getAppMode);
  const extenionInstallDate = useSelector(getExtensionInstallDate);

  useEffect(() => {
    if (!extenionInstallDate) return;

    if (appMode !== GLOBAL_CONSTANTS.APP_MODES.EXTENSION) return;

    // TODO: update release date
    const isNewUser = dateStringToEpoch("2023-10-05") <= dateStringToEpoch(extenionInstallDate);

    if (!isNewUser) return;

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
  }, [appMode, extenionInstallDate]);
};
