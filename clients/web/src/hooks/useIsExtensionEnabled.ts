import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import Logger from "lib/logger";
import APP_CONSTANTS from "config/constants";
import { globalActions } from "store/slices/global/slice";
import { getExtensionVersion, isExtensionEnabled, isExtensionManifestVersion3 } from "actions/ExtensionActions";
import PageScriptMessageHandler from "config/PageScriptMessageHandler";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { captureException } from "@sentry/react";
import { trackExtensionStatusUpdated } from "modules/analytics/events/extension";
import { clientStorageService } from "services/clientStorageService";

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

          PageScriptMessageHandler.addMessageListener(
            "notifyExtensionStatusUpdated",
            (message: { action: string; isExtensionEnabled: boolean; extensionIconState: any }) => {
              const { isExtensionEnabled } = message;
              trackExtensionStatusUpdated({
                isExtensionEnabled: isExtensionEnabled as boolean,
                extensionIconState: JSON.stringify(message.extensionIconState),
              });
              if (isExtensionEnabled !== undefined) {
                dispatch(globalActions.updateIsExtensionEnabled(isExtensionEnabled));
              } else {
                dispatch(globalActions.updateIsExtensionEnabled(true));
                captureException(new Error("Extension status is undefined in notifyExtensionStatusUpdated message"), {
                  extra: {
                    message,
                    extension_version: getExtensionVersion(),
                  },
                });
              }
            }
          );
        } else {
          clientStorageService.getStorageObject("rq_var_isExtensionEnabled").then((value) => {
            if (value !== undefined) {
              dispatch(globalActions.updateIsExtensionEnabled(value));
            } else {
              dispatch(globalActions.updateIsExtensionEnabled(true));
            }
          });
        }
      } else {
        //TODO @nafees87n: cleanup reading settings from storage
        clientStorageService.getStorageObject(APP_CONSTANTS.RQ_SETTINGS).then((value) => {
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
