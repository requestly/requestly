import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Route, Routes, useLocation } from "react-router-dom";
import { Col, Layout, Row } from "antd";
import { isPricingPage, isGoodbyePage, isInvitePage } from "utils/PathUtils.js";
import { getAppMode } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import Footer from "../../components/sections/Footer/index";
import PATHS from "config/constants/sub/paths";
import DashboardContent from "./DashboardContent";
import Sidebar from "./Sidebar";
import MenuHeader from "./MenuHeader";
import { Content } from "antd/lib/layout/layout";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import "./dashboardLayout.scss";

const DashboardLayout = () => {
  const location = useLocation();

  // GLobal State
  const appMode = useSelector(getAppMode);

  // Component State
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const AppFooter = () => {
    return appMode && appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? null : location.pathname.includes(
        PATHS.RULES.MY_RULES.ABSOLUTE
      ) ||
      location.pathname.includes(PATHS.PRICING.ABSOLUTE) ||
      location.pathname.includes(PATHS.HOME.ABSOLUTE) ? (
      <Footer />
    ) : null;
  };

  const isPersonaRecommendationFeatureflagOn =
    useFeatureIsOn("persona_recommendation") && location?.state?.src === "persona_survey_modal";

  const isSidebarVisible = useMemo(
    () => !(isPricingPage() || isGoodbyePage() || isInvitePage() || isPersonaRecommendationFeatureflagOn),
    [isPersonaRecommendationFeatureflagOn]
  );

  return (
    <>
      <Layout className="hp-app-layout">
        {isSidebarVisible && (
          <Sidebar visible={visible} setVisible={setVisible} collapsed={collapsed} setCollapsed={setCollapsed} />
        )}

        <Layout className="hp-bg-color-dark-90">
          {!isPersonaRecommendationFeatureflagOn && <MenuHeader setVisible={setVisible} setCollapsed={setCollapsed} />}

          <Content className="hp-content-main">
            <Row justify="center" style={{ height: "100%" }}>
              <Col span={24}>
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
