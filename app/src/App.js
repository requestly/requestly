import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import isEmpty from "is-empty";
import APP_CONSTANTS from "./config/constants";
import { submitAppDetailAttributes } from "utils/AnalyticsUtils.js";
import { ConfigProvider } from "antd";
import enUS from "antd/lib/locale/en_US";
import useGeoLocation from "hooks/useGeoLocation";
import DashboardLayout from "layouts/DashboardLayout";
import FullScreenLayout from "layouts/FullScreenLayout";
import UpdateDialog from "components/mode-specific/desktop/UpdateDialog";
import ThirdPartyIntegrationsHandler from "hooks/ThirdPartyIntegrationsHandler";
import { CommandBar } from "components/misc/CommandBar";
import { GrowthBookProvider } from "@growthbook/growthbook-react";
import { growthbook } from "utils/feature-flag/growthbook";
import LocalUserAttributesHelperComponent from "hooks/LocalUserAttributesHelperComponent";
import PreLoadRemover from "hooks/PreLoadRemover";
import AppModeInitializer from "hooks/AppModeInitializer";
import DBListeners from "hooks/DbListenerInit/DBListeners";
import RuleExecutionsSyncer from "hooks/RuleExecutionsSyncer";
import FeatureUsageEvent from "hooks/FeatureUsageEvent";
import ActiveWorkspace from "hooks/ActiveWorkspace";
import AuthHandler from "hooks/AuthHandler";

const { PATHS } = APP_CONSTANTS;

const App = () => {
  const location = useLocation();

  useEffect(() => {
    // Load features asynchronously when the app renders
    growthbook.loadFeatures({ autoRefresh: true });
  }, []);

  useGeoLocation();

  submitAppDetailAttributes();

  if (!isEmpty(window.location.hash)) {
    //Support legacy URL formats
    const hashURL = window.location.hash.split("/");
    const hashType = hashURL[0];
    const hashPath = hashURL[1];

    switch (hashType) {
      case PATHS.HASH.SHARED_LISTS:
        window.location.assign(PATHS.SHARED_LISTS.VIEWER.ABSOLUTE + "/" + hashPath);
        break;
      case PATHS.HASH.RULE_EDITOR:
        window.location.replace(PATHS.RULE_EDITOR.EDIT_RULE.ABSOLUTE + "/" + hashPath);
        break;

      default:
        break;
    }
  }

  return (
    <>
      <AuthHandler />
      <PreLoadRemover />
      <AppModeInitializer />
      <DBListeners />
      <RuleExecutionsSyncer />
      <FeatureUsageEvent />
      <ActiveWorkspace />
      <ThirdPartyIntegrationsHandler />

      <ConfigProvider locale={enUS}>
        <GrowthBookProvider growthbook={growthbook}>
          <LocalUserAttributesHelperComponent />
          <div id="requestly-dashboard-layout">
            <CommandBar />
            {"/" + location.pathname.split("/")[1] === PATHS.LANDING ? (
              <FullScreenLayout />
            ) : (
              <>
                <UpdateDialog />
                <DashboardLayout />
              </>
            )}
          </div>
        </GrowthBookProvider>
      </ConfigProvider>
    </>
  );
};

export default App;
