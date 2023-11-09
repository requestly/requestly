import React, { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { isPricingPage, isGoodbyePage, isInvitePage } from "utils/PathUtils.js";
import Footer from "../../components/sections/Footer";
import DashboardContent from "./DashboardContent";
import { Sidebar } from "./Sidebar";
import MenuHeader from "./MenuHeader";
import { useGoogleOneTapLogin } from "hooks/useGoogleOneTapLogin";
import { removeElement } from "utils/domUtils";
import { isAppOpenedInIframe } from "utils/AppUtils";
import { AppNotificationBanner } from "./AppNotificationBanner";
import { httpsCallable, getFunctions } from "firebase/functions";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebaseApp from "../../firebase";
import { actions } from "store";
import Logger from "lib/logger";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { pathname } = location;
  const { promptOneTapOnLoad } = useGoogleOneTapLogin();
  promptOneTapOnLoad();

  const isSidebarVisible = useMemo(
    () => !(isPricingPage(pathname) || isGoodbyePage(pathname) || isInvitePage(pathname)),
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
    const auth = getAuth(firebaseApp);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        try {
          getEnterpriseAdminDetails().then((response) => {
            if (response.data.success) {
              dispatch(actions.updateOrganizationDetails(response.data.enterpriseData));
            }
          });
        } catch (e) {
          Logger.log(e);
        }
      } else {
        dispatch(actions.updateOrganizationDetails(null));
      }
    });
  }, [getEnterpriseAdminDetails, dispatch]);

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
