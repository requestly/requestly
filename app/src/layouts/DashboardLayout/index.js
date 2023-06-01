import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Route, Routes, useLocation } from "react-router-dom";
import { Col, Layout, Row } from "antd";
import { isPricingPage, isGoodbyePage, isInvitePage } from "utils/PathUtils.js";
import { getAppMode, getUserPersonaSurveyDetails } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import MenuFooter from "../../components/sections/Footer/index";
import PATHS from "config/constants/sub/paths";
import DashboardContent from "./DashboardContent";
import Sidebar from "./Sidebar";
import MenuHeader from "./MenuHeader";
import { Content, Footer } from "antd/lib/layout/layout";
import "./dashboardLayout.scss";

const DashboardLayout = () => {
  const location = useLocation();
  const { pathname } = location;

  const appMode = useSelector(getAppMode);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const isPersonaRecommendationScreen = userPersona.page === 4 && !userPersona.isSurveyCompleted;

  // Component State
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const AppFooter = () => {
    return appMode && appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? null : pathname.includes(
        PATHS.RULES.MY_RULES.ABSOLUTE
      ) ||
      pathname.includes(PATHS.PRICING.ABSOLUTE) ||
      pathname.includes(PATHS.HOME.ABSOLUTE) ? (
      <Footer>
        <MenuFooter />
      </Footer>
    ) : null;
  };

  const isSidebarVisible = useMemo(
    () =>
      !(isPricingPage(pathname) || isGoodbyePage(pathname) || isInvitePage(pathname) || isPersonaRecommendationScreen),
    [pathname, isPersonaRecommendationScreen]
  );

  return (
    <>
      <Layout className="hp-app-layout">
        {!isPersonaRecommendationScreen && <MenuHeader setVisible={setVisible} setCollapsed={setCollapsed} />}

        <Layout>
          {isSidebarVisible && (
            <Sidebar visible={visible} setVisible={setVisible} collapsed={collapsed} setCollapsed={setCollapsed} />
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
        </Layout>
        <AppFooter />
      </Layout>
    </>
  );
};

export default DashboardLayout;
