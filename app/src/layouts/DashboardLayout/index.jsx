import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Route, Routes, useLocation } from "react-router-dom";
import { Col, Layout, Row } from "antd";
import { isPricingPage, isGoodbyePage, isInvitePage } from "utils/PathUtils.js";
import { getAppMode, getUserPersonaSurveyDetails } from "store/selectors";
// import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import Footer from "../../components/sections/Footer/index";
import PATHS from "config/constants/sub/paths";
import DashboardContent from "./DashboardContent";
import Sidebar from "./Sidebar";
import { Sidebar as SidebarV2 } from "./SidebarV2";
import MenuHeader from "./MenuHeader";
import { Content } from "antd/lib/layout/layout";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  const location = useLocation();
  const { pathname } = location;

  // const appMode = useSelector(getAppMode);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const isPersonaRecommendationScreen = userPersona.page === 4 && !userPersona.isSurveyCompleted;

  // Component State
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // const AppFooter = () => {
  //   return appMode && appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? null : pathname.includes(
  //       PATHS.RULES.MY_RULES.ABSOLUTE
  //     ) ||
  //     pathname.includes(PATHS.PRICING.ABSOLUTE) ||
  //     pathname.includes(PATHS.HOME.ABSOLUTE) ? (
  //     <Footer />
  //   ) : null;
  // };

  const isSidebarVisible = useMemo(
    () =>
      !(isPricingPage(pathname) || isGoodbyePage(pathname) || isInvitePage(pathname) || isPersonaRecommendationScreen),
    [pathname, isPersonaRecommendationScreen]
  );

  const showNewLayout = true;
  const showNewSidebar = true;

  return showNewLayout ? (
    <>
      <div className={`app-layout ${!showNewSidebar ? "app-layout-sidebar-collapsed" : "app-layout-columns"}`}>
        <div className="app-header">
          {!isPersonaRecommendationScreen && <MenuHeader setVisible={setVisible} setCollapsed={setCollapsed} />}
        </div>

        {/* Sidebar */}
        <div className="app-sidebar">
          {isSidebarVisible && (
            <SidebarV2 visible={visible} setVisible={setVisible} collapsed={collapsed} setCollapsed={setCollapsed} />
            // <Sidebar visible={visible} setVisible={setVisible} collapsed={collapsed} setCollapsed={setCollapsed} />
          )}
        </div>

        <div className="app-main-content">
          <Routes>
            <Route path={PATHS.DASHBOARD + PATHS.ANY} element={<DashboardContent />} />
          </Routes>
        </div>

        <div className="app-footer">
          <Footer />
        </div>
      </div>
    </>
  ) : (
    <>
      <Layout className="hp-app-layout">
        {isSidebarVisible && (
          <Sidebar visible={visible} setVisible={setVisible} collapsed={collapsed} setCollapsed={setCollapsed} />
        )}

        <Layout className="hp-bg-color-dark-90">
          {!isPersonaRecommendationScreen && <MenuHeader setVisible={setVisible} setCollapsed={setCollapsed} />}

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

          {/* <AppFooter /> */}
        </Layout>
      </Layout>
    </>
  );
};

export default DashboardLayout;
