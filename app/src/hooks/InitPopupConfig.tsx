import { StorageService } from "init";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode, getUserAttributes } from "store/selectors";
import { globalActions } from "store/slices/global/slice";

export const InitPopupConfig = () => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const userAttributes = useSelector(getUserAttributes);

  const fetchConfig = useCallback(async () => {
    const popupConfig = await StorageService(appMode).getRecord("popupConfig");
    return popupConfig;
  }, [appMode]);

  const setDefaultConfig = useCallback(async () => {
    const popupConfig = await fetchConfig();
    if (popupConfig) {
      return;
    }
    const defaultConfig = {
      session_replay: true,
    };

    if (userAttributes.num_sessions > 0 || userAttributes.rq_subscription_type === "appsumo") {
      await StorageService(appMode).saveRecord({
        popup_config: defaultConfig,
      });
      dispatch(globalActions.updatePopupConfig(defaultConfig));
    }
  }, [appMode, dispatch, fetchConfig, userAttributes.num_sessions, userAttributes.rq_subscription_type]);

  useEffect(() => {
    // TODO: add feature compatibility
    if (appMode !== "EXTENSION") {
      return;
    }

    setDefaultConfig();
  }, [appMode, setDefaultConfig]);
};
