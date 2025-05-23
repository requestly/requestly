import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import Logger from "lib/logger";
import { StorageService } from "init";
import APP_CONSTANTS from "config/constants";
import { globalActions } from "store/slices/global/slice";
import { isExtensionEnabled, isExtensionManifestVersion3 } from "actions/ExtensionActions";
import PageScriptMessageHandler from "config/PageScriptMessageHandler";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";

export const useIsExtensionEnabled = () => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);

  useEffect(() => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION) {
      Logger.log(`Reading storage in App`);
      if (isExtensionManifestVersion3()) {
        if (isFeatureCompatible(FEATURES.EXTENSION_STATUS_NOTIFICATION)) {
          isExtensionEnabled().then((isEnabled) => {
            dispatch(globalActions.updateIsExtensionEnabled(isEnabled));
          });

          PageScriptMessageHandler.addMessageListener("notifyExtensionStatusUpdated", (message: any) => {
            const { isExtensionEnabled } = message;
            if (isExtensionEnabled !== undefined) {
              dispatch(globalActions.updateIsExtensionEnabled(isExtensionEnabled));
            } else {
              dispatch(globalActions.updateIsExtensionEnabled(true));
            }
          });
        } else {
          StorageService(appMode)
            .getRecord("rq_var_isExtensionEnabled")
            .then((value) => {
              if (value !== undefined) {
                dispatch(globalActions.updateIsExtensionEnabled(value));
              } else {
                dispatch(globalActions.updateIsExtensionEnabled(true));
              }
            });
        }
      } else {
        //TODO @nafees87n: cleanup reading settings from storage
        StorageService(appMode)
          .getRecord(APP_CONSTANTS.RQ_SETTINGS)
          .then((value) => {
            if (value) {
              dispatch(globalActions.updateIsExtensionEnabled(value.isExtensionEnabled));
            } else {
              dispatch(globalActions.updateIsExtensionEnabled(true));
            }
          });
      }
    }

    return () => {
      PageScriptMessageHandler.removeMessageListener("notifyExtensionStatusUpdated");
    };
  }, [appMode, dispatch]);
};
