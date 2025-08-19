import { useFeatureValue } from "@growthbook/growthbook-react";
import FEATURES from "config/constants/sub/features";
import { StorageService } from "init";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { globalActions } from "store/slices/global/slice";
import { isFeatureCompatible } from "utils/CompatibilityUtils";

export const useInitPopupConfig = () => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);

  const isSessionReplayEnabled = useFeatureValue("is_session_replay_enabled", true); // mark default value as false after testing

  const fetchConfig = useCallback(async () => {
    const popupConfig = await StorageService(appMode).getRecord("popup_config");
    return popupConfig;
  }, [appMode]);

  const setDefaultConfig = useCallback(async () => {
    const popupConfig = await fetchConfig();
    if (popupConfig) {
      dispatch(globalActions.updatePopupConfig(popupConfig));
      return;
    }

    const defaultConfig = {
      session_replay: isSessionReplayEnabled,
    };

    await StorageService(appMode).saveRecord({
      popup_config: defaultConfig,
    });
    dispatch(globalActions.updatePopupConfig(defaultConfig));
  }, [appMode, dispatch, fetchConfig, isSessionReplayEnabled]);

  useEffect(() => {
    if (!isFeatureCompatible(FEATURES.POPUP_CONFIG)) {
      return;
    }

    if (appMode !== "EXTENSION") {
      return;
    }

    setDefaultConfig();
  }, [appMode, isSessionReplayEnabled, setDefaultConfig]);
};
