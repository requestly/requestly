import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Layout, Button, Row, Col, Tooltip, Divider } from "antd";
import { getAppMode } from "store/selectors";
import HeaderUser from "layouts/DashboardLayout/MenuHeader/HeaderUser";
import { redirectToRoot, redirectToSettings } from "utils/RedirectionUtils";
import Settings from "assets/icons/settings.svg?react";
import WorkspaceSelector from "layouts/DashboardLayout/MenuHeader/WorkspaceSelector/WorkspaceSelector";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { trackHeaderClicked } from "modules/analytics/events/common/onboarding/header";
// import "layouts/DashboardLayout/MenuHeader/MenuHeader.css";
import "./index.css";

const { Header } = Layout;

const MenuHeader = () => {
  const navigate = useNavigate();
  const appMode = useSelector(getAppMode);

  return (
    <>
      <Header className="layout-header">
        <Row wrap={false} align="middle" justify="space-between" className="w-full">
          <Col flex="1">
            <Row
              align="middle"
              gutter={20}
              style={{
                marginTop: "-8px",
              }}
            >
              <Col className="sessionbear-header-logo">
                <img
                  onClick={() => redirectToRoot(navigate)}
                  src={"/assets/media/common/sessionBearLogoFull.svg"}
                  alt="SessionBear logo"
                />
              </Col>
              <Col className="sessionbear-header-mini-logo">
                <img
                  onClick={() => redirectToRoot(navigate)}
                  src={"/assets/media/common/sessionBearLogoSmall.svg"}
                  alt="SessionBear logo"
                />
              </Col>
              <Col className={appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION ? "extension" : "desktop"}>
                <div className="header-left-section">
                  <WorkspaceSelector />
                </div>
              </Col>
            </Row>
          </Col>
          <Col>
            <div className="header-right-section">
              <Row align="middle" gutter={8} wrap={false}>
                {/* TEMPORARILY HIDDEN  */}
                {/* <Col className="hidden-on-small-screen">
                <span className="github-star-button" onClick={() => trackHeaderClicked("github_star_button")}>
                  <GitHubButton
                    style={{ display: "flex" }}
                    className="github-star-button"
                    href="https://github.com/requestly/requestly"
                    data-color-scheme="dark_dimmed"
                    data-text="Star"
                    data-show-count="true"
                    aria-label="Star Requestly on GitHub"
                  />
                </span>
              </Col> */}
                <Divider type="vertical" className="header-vertical-divider hidden-on-small-screen" />
                {/* settings */}
                <Col>
                  <Tooltip title={<span className="text-gray text-sm">Settings</span>}>
                    <Button
                      type="text"
                      className="header-icon-btn"
                      icon={<Settings />}
                      onClick={() => {
                        trackHeaderClicked("settings");
                        redirectToSettings(navigate, window.location.pathname, "header");
                      }}
                    />
                  </Tooltip>
                </Col>
                <HeaderUser />
              </Row>
            </div>
          </Col>
        </Row>
      </Header>
    </>
  );
};

export default MenuHeader;
