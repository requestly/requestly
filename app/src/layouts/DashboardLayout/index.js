import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Col, Layout, Row } from "antd";
import { isPricingPage, isGoodbyePage, isInvitePage } from "utils/PathUtils.js";
import { getAppMode, getIsWorkspaceOnboardingCompleted, getUserPersonaSurveyDetails } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import Footer from "../../components/sections/Footer/index";
import PATHS from "config/constants/sub/paths";
import DashboardContent from "./DashboardContent";
import Sidebar from "./Sidebar";
import MenuHeader from "./MenuHeader";
import { Content } from "antd/lib/layout/layout";
import { useFeatureValue } from "@growthbook/growthbook-react";
import "./dashboardLayout.scss";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const appMode = useSelector(getAppMode);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const appOnboardingExp = useFeatureValue("app_onboarding", null);
  const isWorkspaceOnboardingCompleted = useSelector(getIsWorkspaceOnboardingCompleted);
  const isWorkspaceOnboardingScreen =
    !isWorkspaceOnboardingCompleted && !userPersona.isSurveyCompleted && appOnboardingExp === "workspace_onboarding";
  const isPersonaRecommendationScreen =
    userPersona.page === 2 && !userPersona.isSurveyCompleted && appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP;
  // Component State
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const AppFooter = () => {
    return appMode && appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? null : pathname.includes(
        PATHS.RULES.MY_RULES.ABSOLUTE
      ) ||
      pathname.includes(PATHS.PRICING.ABSOLUTE) ||
      pathname.includes(PATHS.HOME.ABSOLUTE) ? (
      <Footer />
    ) : null;
  };

  const isSidebarVisible = useMemo(
    () =>
      !(
        isPricingPage(pathname) ||
        isGoodbyePage(pathname) ||
        isInvitePage(pathname) ||
        isWorkspaceOnboardingScreen ||
        isPersonaRecommendationScreen
      ),
    [pathname, isPersonaRecommendationScreen, isWorkspaceOnboardingScreen]
  );

  useEffect(() => {
    if (!isWorkspaceOnboardingCompleted && appOnboardingExp === "workspace_onboarding") {
      navigate(PATHS.GETTING_STARTED, {
        replace: true,
        state: {
          src: "workspace_onboarding",
          redirectTo: location.state?.redirectTo ?? PATHS.RULES.MY_RULES.ABSOLUTE,
        },
      });
    }
  }, [
    navigate,
    location.state?.redirectTo,
    userPersona.page,
    userPersona.isSurveyCompleted,
    appOnboardingExp,
    isWorkspaceOnboardingCompleted,
  ]);

  return (
    <>
      <Layout className="hp-app-layout">
        {isSidebarVisible && (
          <Sidebar visible={visible} setVisible={setVisible} collapsed={collapsed} setCollapsed={setCollapsed} />
        )}

        <Layout className="hp-bg-color-dark-90">
          {!isWorkspaceOnboardingScreen && !isPersonaRecommendationScreen && (
            <MenuHeader setVisible={setVisible} setCollapsed={setCollapsed} />
          )}

          <Content className="hp-content-main">
            <Row justify="center" style={{ height: "100%" }}>
              <Col span={24} style={{ height: "100%" }}>
                <React.Fragment>
                  <Routes>
                    <Route path={PATHS.DASHBOARD + PATHS.ANY} element={<DashboardContent />} />
                  </Routes>
                </React.Fragment>
              </Col>
            </Row>
          </Content>

          <AppFooter />
        </Layout>
      </Layout>
    </>
  );
};

export default DashboardLayout;
