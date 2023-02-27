import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import isEmpty from "is-empty";
import APP_CONSTANTS from "./config/constants";
import { getAuthInitialization } from "./store/selectors";
import { submitAppDetailAttributes } from "utils/AnalyticsUtils.js";
import removePreloader from "./actions/UI/removePreloader";
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
import { PersonaSurveyModal } from "components/misc/PersonaSurvey";

const { PATHS } = APP_CONSTANTS;

const App = () => {
  const location = useLocation();

  // Global State
  const hasAuthInitialized = useSelector(getAuthInitialization);

  submitAppDetailAttributes();

  useAuth();
  useThirdPartyIntegrations();
  useAppModeInitializer();
  useDatabase();
  useGeoLocation();
  useRuleExecutionsSyncer();
  useFeatureUsageEvent();
  useActiveWorkspace();

  useEffect(() => {
    if (hasAuthInitialized) {
      removePreloader();
    }
  }, [hasAuthInitialized]);

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
      <div
        id="requestly-dashboard-layout"
        style={{
          height: "100vh",
        }}
      >
        <CommandBar />
        <PersonaSurveyModal />
        {"/" + location.pathname.split("/")[1] === PATHS.LANDING ? (
          <FullScreenLayout />
        ) : (
          <>
            <UpdateDialog />
            <DashboardLayout />
          </>
        )}
      </div>
    </ConfigProvider>
  );
};

export default App;
