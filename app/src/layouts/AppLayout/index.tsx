import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { submitAppDetailAttributes } from 'utils/AnalyticsUtils.js';
import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import useGeoLocation from 'hooks/useGeoLocation';
import UpdateDialog from 'components/mode-specific/desktop/UpdateDialog';
import ThirdPartyIntegrationsHandler from 'hooks/ThirdPartyIntegrationsHandler';
import { CommandBar } from 'components/misc/CommandBar';
import { GrowthBookProvider } from '@growthbook/growthbook-react';
import { growthbook } from 'utils/feature-flag/growthbook';
import LocalUserAttributesHelperComponent from 'hooks/LocalUserAttributesHelperComponent';
import usePreLoadRemover from 'hooks/usePreLoadRemover';
import AppModeInitializer from 'hooks/AppModeInitializer';
import DBListeners from 'hooks/DbListenerInit/DBListeners';
// import RuleExecutionsSyncer from "hooks/RuleExecutionsSyncer";
import FeatureUsageEvent from 'hooks/FeatureUsageEvent';
import ActiveWorkspace from 'hooks/ActiveWorkspace';
import AuthHandler from 'hooks/AuthHandler';
import ExtensionContextInvalidationNotice from 'components/misc/notices/ExtensionContextInvalidationNotice';
import AutomationNotAllowedNotice from 'components/misc/notices/AutomationNotAllowedNotice';
import { useIsExtensionEnabled } from 'hooks';
import { LazyMotion, domMax } from 'framer-motion';
import { useBillingTeamsListener } from 'backend/billing/hooks/useBillingTeamsListener';
import ThemeProvider from 'lib/design-system-v2/helpers/ThemeProvider';
import { InitImplicitWidgetConfigHandler } from 'components/features/rules/TestThisRule';
import APP_CONSTANTS from 'config/constants';
import { GlobalModals } from './GlobalModals';
import { LoginRequiredHandler } from 'hooks/LoginRequiredHandler';
import { useAppLanguageObserver } from 'hooks/useAppLanguageObserver';
import useClientStorageService from 'services/clientStorageService/hooks/useClientStorageService';
import { BlockScreenHoc } from 'componentsV2/BlockScreen/BlockScreenHoc';
import { AppUpdateNotifier } from 'componentsV2/AppUpdateNotifier/AppUpdateNotifier';
import { NotificationsContainer } from '@browserstack/design-stack';

const { PATHS } = APP_CONSTANTS;
const App: React.FC = () => {
  useEffect(() => {
    // Load features asynchronously when the app renders
    growthbook.loadFeatures({ autoRefresh: true });
  }, []);

  usePreLoadRemover();
  useClientStorageService();
  useGeoLocation();
  useIsExtensionEnabled();
  useBillingTeamsListener();
  useAppLanguageObserver();
  // useInitializeNewUserSessionRecordingConfig();

  submitAppDetailAttributes();

  if (!isEmpty(window.location.hash)) {
    //Support legacy URL formats
    const hashURL = window.location.hash.split('/');
    const hashType = hashURL[0];
    const hashPath = hashURL[1];

    switch (hashType) {
      case PATHS.HASH.SHARED_LISTS:
        window.location.assign(
          PATHS.SHARED_LISTS.VIEWER.ABSOLUTE + '/' + hashPath
        );
        break;
      case PATHS.HASH.RULE_EDITOR:
        window.location.replace(
          PATHS.RULE_EDITOR.EDIT_RULE.ABSOLUTE + '/' + hashPath
        );
        break;

      default:
        break;
    }
  }

  return (
    <>
      <ExtensionContextInvalidationNotice />
      <AutomationNotAllowedNotice />
      <AppModeInitializer />
      <AuthHandler />
      <AppUpdateNotifier />

      <GrowthBookProvider growthbook={growthbook}>
        <DBListeners />
        {/* <RuleExecutionsSyncer /> */}
        {/* @ts-ignore */}
        <ActiveWorkspace />
        {/* @ts-ignore */}
        <ThirdPartyIntegrationsHandler />
        <ThemeProvider>
          <ConfigProvider locale={enUS}>
            {/* @ts-ignore */}
            <InitImplicitWidgetConfigHandler />
            <LocalUserAttributesHelperComponent />
            <FeatureUsageEvent />
            <LazyMotion features={domMax} strict>
              <div id="requestly-dashboard-layout">
                <LoginRequiredHandler />
                <CommandBar />
                <UpdateDialog />
                <GlobalModals />
                {/* @ts-ignore */}
                <NotificationsContainer wrapperClassName={'bs-ds-scope'} />
                <BlockScreenHoc>
                  <Outlet />
                </BlockScreenHoc>
              </div>
            </LazyMotion>
          </ConfigProvider>
        </ThemeProvider>
      </GrowthBookProvider>
    </>
  );
};

export default App;
