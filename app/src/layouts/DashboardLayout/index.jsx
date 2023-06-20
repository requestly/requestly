import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import useOnboarding from "hooks/useOnboarding";
import { isPricingPage, isGoodbyePage, isInvitePage } from "utils/PathUtils.js";
import Footer from "../../components/sections/Footer";
import DashboardContent from "./DashboardContent";
import { Sidebar } from "./Sidebar";
import MenuHeader from "./MenuHeader";
import "./DashboardLayout.css";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  const location = useLocation();
  const { pathname } = location;
  const { showPersonaOnboarding, showWorkspaceOnboarding } = useOnboarding();

  const isSidebarVisible = useMemo(
    () =>
      !(
        isPricingPage(pathname) ||
        isGoodbyePage(pathname) ||
        isInvitePage(pathname) ||
        showWorkspaceOnboarding ||
        showPersonaOnboarding
      ),
    [pathname, showPersonaOnboarding, showWorkspaceOnboarding]
  );

  return (
    <>
      <div className="app-layout app-dashboard-layout">
        <div className="app-header">{!showPersonaOnboarding && !showWorkspaceOnboarding && <MenuHeader />}</div>

        <div className="app-sidebar">{isSidebarVisible && <Sidebar />}</div>

        <div className="app-main-content">
          <DashboardContent />
        </div>

        <div className="app-footer">{!showPersonaOnboarding && <Footer />}</div>
      </div>
    </>
  );
};

export default DashboardLayout;
