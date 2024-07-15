import { useMemo } from "react";
import { useSelector } from "react-redux";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import InstallExtensionCTA from "../../../../components/misc/InstallExtensionCTA";
import { isExtensionInstalled } from "actions/ExtensionActions";
import APP_CONSTANTS from "../../../../config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isFeatureCompatible } from "../../../../utils/CompatibilityUtils";
import DataCollection from "./components/DataCollection";
import RulesSyncing from "./components/RulesSyncing";
import { ImplicitRuleTesting } from "./components/ImplicitRuleTesting";
import "./index.scss";
import { BlockList } from "./components/BlockListSettings/BlockListSettings";

export const GlobalSettings = () => {
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);

  const isImplicitTestThisRuleCompatible = useMemo(
    () => isFeatureCompatible(APP_CONSTANTS.FEATURES.IMPLICIT_TEST_THIS_RULE),
    []
  );

  if (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP && !isExtensionInstalled()) {
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
        {appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION && isImplicitTestThisRuleCompatible ? (
          <ImplicitRuleTesting />
        ) : null}
        {appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION && isFeatureCompatible(APP_CONSTANTS.FEATURES.BLOCK_LIST) && (
          <BlockList />
        )}
      </div>
    </div>
  );
};
