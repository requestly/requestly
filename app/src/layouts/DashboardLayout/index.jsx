import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getIsPlanExpiredBannerClosed, getUserAuthDetails } from "store/selectors";
import { useLocation } from "react-router-dom";
import { isPricingPage, isGoodbyePage, isInvitePage, isSettingsPage } from "utils/PathUtils.js";
import Footer from "../../components/sections/Footer";
import DashboardContent from "./DashboardContent";
import { Sidebar } from "./Sidebar";
import MenuHeader from "./MenuHeader";
import { useGoogleOneTapLogin } from "hooks/useGoogleOneTapLogin";
import { removeElement } from "utils/domUtils";
import { isAppOpenedInIframe } from "utils/AppUtils";
import { AppNotificationBanner } from "../../componentsV2/AppNotificationBanner";
import { httpsCallable, getFunctions } from "firebase/functions";
import { actions } from "store";
import "./DashboardLayout.css";
import Logger from "lib/logger";
import { PlanExpiredBanner } from "componentsV2/banners/PlanExpiredBanner";

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { pathname } = location;
  const { initializeOneTap, promptOneTap, shouldShowOneTapPrompt } = useGoogleOneTapLogin();
  const user = useSelector(getUserAuthDetails);
  const isPlanExpiredBannerClosed = useSelector(getIsPlanExpiredBannerClosed);

  initializeOneTap();

  if (shouldShowOneTapPrompt()) {
    promptOneTap();
  }

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
            dispatch(actions.updateOrganizationDetails(response.data.enterpriseData));
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
      <div
        className="app-layout app-dashboard-layout"
        style={{
          height:
            user?.details?.planDetails?.status === "canceled" && !isPlanExpiredBannerClosed
              ? "calc(100vh - 46px)"
              : "100vh",
        }}
      >
        <div className="app-header">
          {" "}
          <MenuHeader />
        </div>

        <div className="app-sidebar">{isSidebarVisible && <Sidebar />}</div>

        <div className="app-main-content">
          <DashboardContent />
        </div>

        <div className="app-footer">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
