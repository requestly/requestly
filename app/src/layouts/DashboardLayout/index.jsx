import React, { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { isPricingPage, isGoodbyePage, isInvitePage } from "utils/PathUtils.js";
import Footer from "../../components/sections/Footer";
import DashboardContent from "./DashboardContent";
import { Sidebar } from "./Sidebar";
import MenuHeader from "./MenuHeader";
import { useGoogleOneTapLogin } from "hooks/useGoogleOneTapLogin";
import { removeElement } from "utils/domUtils";
import { isAppOpenedInIframe } from "utils/AppUtils";
import "./DashboardLayout.css";
import { AppNotificationBanner } from "./AppNotificationBanner";

const DashboardLayout = () => {
  const location = useLocation();
  const { pathname } = location;
  const { promptOneTapOnLoad } = useGoogleOneTapLogin();

  promptOneTapOnLoad();

  const isSidebarVisible = useMemo(
    () => !(isPricingPage(pathname) || isGoodbyePage(pathname) || isInvitePage(pathname)),
    [pathname]
  );

  useEffect(() => {
    if (!isAppOpenedInIframe()) return;

    removeElement(".app-sidebar");
    removeElement(".app-header");
    removeElement(".app-footer");
  }, []);

  return (
    <>
      <AppNotificationBanner />
      <div className="app-layout app-dashboard-layout">
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
