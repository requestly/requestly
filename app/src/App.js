import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import isEmpty from "is-empty";
import APP_CONSTANTS from "./config/constants";
import { submitAppDetailAttributes } from "utils/AnalyticsUtils.js";
import { ConfigProvider } from "antd";
import enUS from "antd/lib/locale/en_US";
import useAuth from "hooks/useAuth";
import useDatabase from "hooks/DbListenerInit/useDatabase";
import useGeoLocation from "hooks/useGeoLocation";
import useAppModeInitializer from "hooks/useAppModeInitializer";
import DashboardLayout from "layouts/DashboardLayout";
import FullScreenLayout from "layouts/FullScreenLayout";
import UpdateDialog from "components/mode-specific/desktop/UpdateDialog";
import useThirdPartyIntegrations from "hooks/useThirdPartyIntegrations";
import useRuleExecutionsSyncer from "hooks/useRuleExecutionsSyncer";
import useFeatureUsageEvent from "hooks/useFeatureUsageEvent";
import useActiveWorkspace from "hooks/useActiveWorkspace";
import { CommandBar } from "components/misc/CommandBar";
import { GrowthBookProvider } from "@growthbook/growthbook-react";
import { growthbook } from "utils/feature-flag/growthbook";
import LocalUserAttributesHelperComponent from "hooks/LocalUserAttributesHelperComponent";
import AuthInitializerComponent from "hooks/AuthInitializerComponent";

const { PATHS } = APP_CONSTANTS;

const App = () => {
  const location = useLocation();

  useEffect(() => {
    // Load features asynchronously when the app renders
    growthbook.loadFeatures({ autoRefresh: true });
  }, []);

  useAuth();
  useThirdPartyIntegrations();
  useAppModeInitializer();
  useDatabase();
  useGeoLocation();
  useRuleExecutionsSyncer();
  useFeatureUsageEvent();
  useActiveWorkspace();

  submitAppDetailAttributes();

  if (!isEmpty(window.location.hash)) {
    //Support legacy URL formats
    const hashURL = window.location.hash.split("/");
    const hashType = hashURL[0];
    const hashPath = hashURL[1];

    switch (hashType) {
      case PATHS.HASH.SHARED_LISTS:
        window.location.assign(
          PATHS.SHARED_LISTS.VIEWER.ABSOLUTE + "/" + hashPath
        );
        break;
      case PATHS.HASH.RULE_EDITOR:
        window.location.replace(
          PATHS.RULE_EDITOR.EDIT_RULE.ABSOLUTE + "/" + hashPath
        );
        break;

      default:
        break;
    }
  }

  return (
    <ConfigProvider locale={enUS}>
      <GrowthBookProvider growthbook={growthbook}>
        <AuthInitializerComponent />
        <LocalUserAttributesHelperComponent />

        <div
          id="requestly-dashboard-layout"
          style={{
            height: "100vh",
          }}
        >
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
  );
};

export default App;
