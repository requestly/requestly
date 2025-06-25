import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import Footer from "../../components/sections/Footer";
import DashboardContent from "./DashboardContent";
import { Sidebar } from "./Sidebar";
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
import { getUserOS } from "utils/osUtils";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import useRootPathRedirector from "hooks/useRootPathRedirector";
import { ViewOnlyModeBanner } from "components/common/ViewOnlyModeBanner/ViewOnlyModeBanner";
import { useCurrentWorkspaceUserRole } from "hooks";
import { TeamRole } from "types";
import { Conditional } from "components/common/Conditional";
import { MenuHeader } from "./MenuHeader/MenuHeader";

const DashboardLayout = ({ sidebar = true }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const { isDesktopAppConnected } = useDesktopAppConnection();
  const { role } = useCurrentWorkspaceUserRole();
  const isReadRole = role === TeamRole.read;

  useRootPathRedirector();

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
            {sidebar ? (
              <div className="app-sidebar">
                <Sidebar />
              </div>
            ) : null}
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
