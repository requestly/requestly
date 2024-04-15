import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import InstallExtensionCTA from "../../../../components/misc/InstallExtensionCTA";
import * as ExtensionActions from "../../../../actions/ExtensionActions";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import DataCollection from "./components/DataCollection";
import RulesSyncing from "./components/RulesSyncing";
import { ImplicitRuleTesting } from "./components/ImplicitRuleTesting";
import "./index.scss";

export const GlobalSettings = () => {
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const [storageType, setStorageType] = useState("");

  useEffect(() => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION) {
      ExtensionActions.getStorageInfo().then((response) => {
        setStorageType(response.storageType);
      });
    }
  }, [appMode, setStorageType]);

  if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION && !storageType) {
    return <InstallExtensionCTA heading="Requestly Extension Settings" eventPage="settings_page" />;
  }

  return (
    <div className="global-settings-container">
      <div className="global-settings-wrapper">
        <div className="settings-header header">⚙️ Global Settings</div>
        <p className="text-gray text-sm settings-caption">
          Please enable the following settings to get the best experience
        </p>
        <div>
          <RulesSyncing />
          {user?.loggedIn ? <DataCollection /> : null}
        </div>
        {appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION ? <ImplicitRuleTesting /> : null}
      </div>
    </div>
  );
};
