import React, { useCallback, useMemo } from "react";
import { Checkbox } from "antd";
import SettingsItem from "../SettingsItem";
import { getAppMode, getPopupConfig } from "store/selectors";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { trackEvent } from "modules/analytics";
import { clientStorageService } from "services/clientStorageService";

const CONFIG_OPTIONS = [
  {
    label: "Session Replay",
    value: "session_replay",
  },
];

export const PopupConfig: React.FC = () => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const popupConfig = useSelector(getPopupConfig);

  const enabledKeys = useMemo(() => {
    return Object.keys(popupConfig).filter((key) => popupConfig[key] === true);
  }, [popupConfig]);

  const handleCheckboxChange = useCallback(
    async (checkedValues: string[]) => {
      const config = CONFIG_OPTIONS.reduce((acc, { value }) => {
        acc[value] = checkedValues.includes(value);
        return acc;
      }, {} as Record<string, boolean>);

      await clientStorageService.saveStorageObject({ popup_config: config });
      dispatch(globalActions.updatePopupConfig(config));
      trackEvent("popup_config_updated", {
        config,
      });
    },
    [dispatch]
  );

  if (appMode !== "EXTENSION") {
    return null;
  }

  return (
    <SettingsItem
      isActive={true}
      onChange={() => {}}
      title="Popup Configuration"
      caption="Show or hide elements in the extension popup"
      settingsBody={
        <div className="popup-config-list">
          <Checkbox.Group
            className="popup-config-checkbox-group"
            options={CONFIG_OPTIONS}
            value={enabledKeys}
            onChange={handleCheckboxChange}
          />
        </div>
      }
      isTogglable={false}
    />
  );
};
