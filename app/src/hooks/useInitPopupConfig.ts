import { useFeatureValue } from "@growthbook/growthbook-react";
import FEATURES from "config/constants/sub/features";
import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clientStorageService } from "services/clientStorageService";
import { getAppMode } from "store/selectors";
import { globalActions } from "store/slices/global/slice";
import { isFeatureCompatible } from "utils/CompatibilityUtils";

export const useInitPopupConfig = () => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);

  const isSessionReplayEnabled = useFeatureValue("is_session_replay_enabled", false);
  const shouldSetDefaultConfig = useMemo(() => isSessionReplayEnabled && isFeatureCompatible(FEATURES.POPUP_CONFIG), [
    isSessionReplayEnabled,
  ]);

  const fetchConfig = useCallback(async () => {
    const popupConfig = await clientStorageService.getStorageObject("popup_config");
    return popupConfig;
  }, []);

  const setDefaultConfig = useCallback(async () => {
    const popupConfig = await fetchConfig();
    if (popupConfig) {
      dispatch(globalActions.updatePopupConfig(popupConfig));
      return;
    }

    if (shouldSetDefaultConfig) {
      const defaultConfig = {
        session_replay: isSessionReplayEnabled ?? false,
      };

      await clientStorageService.saveStorageObject({
        popup_config: defaultConfig,
      });
      dispatch(globalActions.updatePopupConfig(defaultConfig));
    }
  }, [dispatch, fetchConfig, isSessionReplayEnabled, shouldSetDefaultConfig]);

  useEffect(() => {
    if (appMode !== "EXTENSION") {
      return;
    }

    setDefaultConfig();
  }, [appMode, setDefaultConfig, shouldSetDefaultConfig]);
};
