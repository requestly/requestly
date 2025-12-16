import { useMemo } from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import InstallExtensionCTA from "../../../../components/misc/InstallExtensionCTA";
import { isExtensionInstalled, isSafariExtension } from "actions/ExtensionActions";
import APP_CONSTANTS from "../../../../config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isFeatureCompatible } from "../../../../utils/CompatibilityUtils";
import DataCollection from "./components/DataCollection";
import RulesSyncing from "./components/RulesSyncing";
import { ImplicitRuleTesting } from "./components/ImplicitRuleTesting";
import "./index.scss";
import { BlockList } from "./components/BlockListSettings/BlockListSettings";
import { SafariLimitedSupportView } from "componentsV2/SafariExtension/SafariLimitedSupportView";
import { PopupConfig } from "./components/PopupConfig/PopupConfig";
import { AIConsentSetting } from "./components/AIConsentSetting/AIConsentSetting";

export const GlobalSettings = () => {
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);

  const isImplicitTestThisRuleCompatible = useMemo(
    () => isFeatureCompatible(APP_CONSTANTS.FEATURES.IMPLICIT_TEST_THIS_RULE),
    []
  );

  if (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
    if (!isExtensionInstalled()) {
      return <InstallExtensionCTA heading="Requestly Extension Settings" eventPage="settings_page" />;
    }
    if (isSafariExtension()) {
      return <SafariLimitedSupportView />;
    }
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
        <AIConsentSetting />
        {appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION && isImplicitTestThisRuleCompatible ? (
          <ImplicitRuleTesting />
        ) : null}
        {isFeatureCompatible(APP_CONSTANTS.FEATURES.BLOCK_LIST) && <BlockList />}
        {isFeatureCompatible(APP_CONSTANTS.FEATURES.POPUP_CONFIG) && <PopupConfig />}
      </div>
    </div>
  );
};
