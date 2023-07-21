import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import InstallExtensionCTA from "../../../../components/misc/InstallExtensionCTA";
import * as ExtensionActions from "../../../../actions/ExtensionActions";
import APP_CONSTANTS from "../../../../config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isFeatureCompatible } from "../../../../utils/CompatibilityUtils";
import ConsoleLogger from "./ConsoleLogger";
import DataCollection from "./DataCollection";
import RulesSyncing from "./RulesSyncing";

const GlobalSettings = ({ appMode }) => {
  const user = useSelector(getUserAuthDetails);
  const [storageType, setStorageType] = useState("");

  useEffect(() => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION) {
      ExtensionActions.getStorageInfo().then((response) => {
        setStorageType(response.storageType);
      });
    }
  }, [appMode, setStorageType]);

  const isCompatible = useMemo(() => isFeatureCompatible(APP_CONSTANTS.FEATURES.EXTENSION_CONSOLE_LOGGER), []);

  if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION && !storageType) {
    return <InstallExtensionCTA heading="Requestly Extension Settings" eventPage="settings_page" />;
  }

  return (
    <>
      <div className="settings-header header">⚙️ Global Settings</div>
      <p className="text-gray text-sm settings-caption">
        Please enable the following settings to get the best experience
      </p>
      <div>
        {appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION && <ConsoleLogger isCompatible={isCompatible} />}
        <RulesSyncing />
        {user?.loggedIn ? <DataCollection /> : null}
      </div>
    </>
  );
};

export default GlobalSettings;
