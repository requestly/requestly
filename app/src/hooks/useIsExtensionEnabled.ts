import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import Logger from "lib/logger";
import { StorageService } from "init";
import { actions } from "store";

export const useIsExtensionEnabled = () => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);

  useEffect(() => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION) {
      Logger.log(`Reading storage in App`);
      StorageService(appMode)
        .getRecord("rq_var_isExtensionEnabled")
        .then((value) => {
          if (value !== undefined) {
            dispatch(actions.updateIsExtensionEnabled(value));
          } else {
            dispatch(actions.updateIsExtensionEnabled(true));
          }
        });
    }
  }, [appMode, dispatch]);
};
