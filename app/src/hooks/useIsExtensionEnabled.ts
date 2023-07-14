import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import Logger from "lib/logger";
import { StorageService } from "init";
import APP_CONSTANTS from "config/constants";
import { actions } from "store";

export const useIsExtensionEnabled = () => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);

  useEffect(() => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION) {
      Logger.log(`Reading storage in App`);
      StorageService(appMode)
        .getRecord(APP_CONSTANTS.RQ_SETTINGS)
        .then((value) => {
          if (value) {
            dispatch(actions.updateIsExtensionEnabled(value.isExtensionEnabled));
          } else {
            dispatch(actions.updateIsExtensionEnabled(true));
          }
        });
    }
  }, [appMode, dispatch]);
};
