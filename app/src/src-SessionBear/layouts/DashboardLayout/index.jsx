import React, { useEffect } from "react";
import MenuHeader from "../../components/MenuHeader";
// import { useGoogleOneTapLogin } from "hooks/useGoogleOneTapLogin";
import { removeElement } from "utils/domUtils";
import { isAppOpenedInIframe } from "utils/AppUtils";
import DashboardContent from "layouts/DashboardLayout/DashboardContent";
import "../../../layouts/DashboardLayout/DashboardLayout.scss";

const DashboardLayout = () => {
  // const { initializeOneTap, promptOneTap, shouldShowOneTapPrompt } = useGoogleOneTapLogin();

  // initializeOneTap();

  // if (shouldShowOneTapPrompt()) {
  //   promptOneTap();
  // }

  useEffect(() => {
    if (!isAppOpenedInIframe()) return;
    removeElement(".app-header");
  }, []);

  return (
    <>
      <div className="app-layout app-dashboard-layout">
        <div className="app-header">
          <MenuHeader />
        </div>
        <div className="app-main-content">
          <DashboardContent />
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
