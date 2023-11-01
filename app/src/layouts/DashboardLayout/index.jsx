import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
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
import { actions } from "store";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { pathname } = location;
  const { promptOneTapOnLoad } = useGoogleOneTapLogin();
  const user = useSelector(getUserAuthDetails);

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

  console.log(user);

  useEffect(() => {
    if (user.loggedIn) {
      getEnterpriseAdminDetails().then((response) => {
        if (response.data.success) {
          dispatch(actions.updateOrganizationDetails(response.data.enterpriseData));
        }
      });
    }
  }, [getEnterpriseAdminDetails, user.loggedIn, dispatch]);

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
