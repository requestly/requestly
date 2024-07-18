import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import isEmpty from "is-empty";
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
// import RuleExecutionsSyncer from "hooks/RuleExecutionsSyncer";
import FeatureUsageEvent from "hooks/FeatureUsageEvent";
import ActiveWorkspace from "hooks/ActiveWorkspace";
import AuthHandler from "hooks/AuthHandler";
import ExtensionContextInvalidationNotice from "components/misc/notices/ExtensionContextInvalidationNotice";
import AutomationNotAllowedNotice from "components/misc/notices/AutomationNotAllowedNotice";
import { useIsExtensionEnabled } from "hooks";
import { LazyMotion, domMax } from "framer-motion";
import { useBillingTeamsListener } from "backend/billing/hooks/useBillingTeamsListener";
import ThemeProvider from "lib/design-system-v2/helpers/ThemeProvider";
import { InitImplicitWidgetConfigHandler } from "components/features/rules/TestThisRule";
import useAppUpdateChecker from "hooks/appUpdateChecker/useAppUpdateChecker";
import { useFetchIncentivizationDetails } from "features/incentivization/hooks";
import APP_CONSTANTS from "config/constants";

const { PATHS } = APP_CONSTANTS;
const App = () => {
  const location = useLocation();

  useEffect(() => {
    // Load features asynchronously when the app renders
    growthbook.loadFeatures({ autoRefresh: true });
  }, []);

  useGeoLocation();
  useIsExtensionEnabled();
  useBillingTeamsListener();
  // useInitializeNewUserSessionRecordingConfig();

  submitAppDetailAttributes();
  useAppUpdateChecker();
  useFetchIncentivizationDetails();

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
      <ExtensionContextInvalidationNotice />
      <AutomationNotAllowedNotice />
      <AuthHandler />
      <PreLoadRemover />
      <AppModeInitializer />
      <DBListeners />
      {/* <RuleExecutionsSyncer /> */}
      {/* @ts-ignore */}
      <ActiveWorkspace />
      {/* @ts-ignore */}
      <ThirdPartyIntegrationsHandler />
      <ThemeProvider>
        <ConfigProvider locale={enUS}>
          <GrowthBookProvider growthbook={growthbook}>
            {/* @ts-ignore */}
            <InitImplicitWidgetConfigHandler />
            <LocalUserAttributesHelperComponent />
            <FeatureUsageEvent />
            <LazyMotion features={domMax} strict>
              <div id="requestly-dashboard-layout">
                <CommandBar />
                <UpdateDialog />
                <Outlet />
              </div>
            </LazyMotion>
          </GrowthBookProvider>
        </ConfigProvider>
      </ThemeProvider>
    </>
  );
};

export default App;
