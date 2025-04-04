import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useLocation } from "react-router-dom";
import { isPricingPage, isGoodbyePage, isInvitePage, isSettingsPage } from "utils/PathUtils.js";
import Footer from "../../components/sections/Footer";
import DashboardContent from "./DashboardContent";
import { Sidebar } from "./Sidebar";
import MenuHeader from "./MenuHeader";
// import { useGoogleOneTapLogin } from "hooks/useGoogleOneTapLogin";
import { removeElement } from "utils/domUtils";
import { isAppOpenedInIframe, isDesktopMode } from "utils/AppUtils";
import { AppNotificationBanner } from "../../componentsV2/AppNotificationBanner";
import { httpsCallable, getFunctions } from "firebase/functions";
import { globalActions } from "store/slices/global/slice";
import Logger from "lib/logger";
import { PlanExpiredBanner } from "componentsV2/banners/PlanExpiredBanner";
import SupportPanel from "components/misc/SupportPanel";
import { useDesktopAppConnection } from "hooks/useDesktopAppConnection";
import "./DashboardLayout.scss";
import { ConnectedToDesktopView } from "./ConnectedToDesktopView/ConnectedToDesktopView";
import { getUserOS } from "utils/Misc";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import useRootPathRedirector from "hooks/useRootPathRedirector";
import { ViewOnlyModeBanner } from "components/common/ViewOnlyModeBanner/ViewOnlyModeBanner";
import { useCurrentWorkspaceUserRole } from "hooks";
import { TeamRole } from "types";
import { Conditional } from "components/common/Conditional";

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { pathname } = location;
  // const { initializeOneTap, promptOneTap, shouldShowOneTapPrompt } = useGoogleOneTapLogin();
  const user = useSelector(getUserAuthDetails);
  const { isDesktopAppConnected } = useDesktopAppConnection();
  const { role } = useCurrentWorkspaceUserRole();
  const isReadRole = role === TeamRole.read;

  useRootPathRedirector();
  // initializeOneTap();

  // if (shouldShowOneTapPrompt()) {
  //   promptOneTap();
  // }

  const isSidebarVisible = useMemo(
    () => !(isPricingPage(pathname) || isGoodbyePage(pathname) || isInvitePage(pathname) || isSettingsPage(pathname)),
    [pathname]
  );

  const getEnterpriseAdminDetails = useMemo(() => httpsCallable(getFunctions(), "getEnterpriseAdminDetails"), []);

  useEffect(() => {
    if (!isAppOpenedInIframe()) return;

    removeElement(".app-sidebar");
    removeElement(".app-header");
    removeElement(".app-footer");
  }, []);

  useEffect(() => {
    if (user.loggedIn && !user?.details?.organization) {
      try {
        getEnterpriseAdminDetails().then((response) => {
          if (response.data.success) {
            dispatch(globalActions.updateOrganizationDetails(response.data.enterpriseData));
          }
        });
      } catch (e) {
        Logger.log(e);
      }
    }
  }, [getEnterpriseAdminDetails, user.loggedIn, user?.details?.organization, dispatch]);

  return (
    <>
      <AppNotificationBanner />
      <PlanExpiredBanner />

      <div className={`app-layout app-dashboard-layout  ${isReadRole ? "read-role" : ""}`}>
        <div
          className={`app-header ${
            isDesktopMode() && isFeatureCompatible(FEATURES.FRAMELESS_DESKTOP_APP)
              ? `app-mode-desktop app-mode-desktop-${getUserOS()}`
              : ""
          }`}
        >
          <MenuHeader />
          <Conditional condition={isReadRole}>
            <ViewOnlyModeBanner />
          </Conditional>
        </div>

        {isDesktopAppConnected ? (
          <ConnectedToDesktopView />
        ) : (
          <>
            <div className="app-sidebar">{isSidebarVisible && <Sidebar />}</div>
            <div className="app-main-content">
              <DashboardContent />
            </div>
            <SupportPanel />
            <div className="app-footer">
              <Footer />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DashboardLayout;
