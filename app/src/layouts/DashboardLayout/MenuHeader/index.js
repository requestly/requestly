import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Layout, Button, Row, Col, Tooltip, Divider } from "antd";
import HeaderUser from "./HeaderUser";
import HeaderText from "./HeaderText";
import { SlackOutlined } from "@ant-design/icons";
import { redirectToSettings } from "utils/RedirectionUtils";
import GitHubButton from "react-github-btn";
import { useMediaQuery } from "react-responsive";
import { ReactComponent as Settings } from "assets/icons/settings.svg";
import LINKS from "config/constants/sub/links";
import PATHS from "config/constants/sub/paths";
import { RQBadge } from "lib/design-system/components/RQBadge";
import WorkspaceSelector from "../Sidebar/WorkspaceSelector";
import { isGoodbyePage, isInvitePage, isPricingPage } from "utils/PathUtils";
import { trackHeaderClicked, trackTopbarClicked } from "modules/analytics/events/common/onboarding/header";
import "./MenuHeader.css";

const { Header } = Layout;

const MenuHeader = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isTabletView = useMediaQuery({ query: "(max-width: 1200px)" });
  const randomNumberBetween1And2 = Math.floor(Math.random() * 2) + 1;
  const isPricingOrGoodbyePage = isPricingPage() || isGoodbyePage() || isInvitePage();
  const editorPaths = [
    // "/rules/editor",
    // "/mocks/editor",
    // "/filesv2/editor",
    // "/mock-server/viewer",
    "/pricing",
    "/invite",
  ];

  //don't show general app header component for editor screens
  const showMenuHeader = () => !editorPaths.some((path) => pathname.includes(path));

  return showMenuHeader() ? (
    <Header className="layout-header">
      <Row wrap={false} align="middle" className="w-full">
        {!isPricingOrGoodbyePage ? (
          <Col span={8}>
            <div className="header-left-section">
              <Link to={PATHS.RULES.MY_RULES.ABSOLUTE} onClick={() => trackTopbarClicked("home")}>
                Home
              </Link>

              <WorkspaceSelector />

              <a
                target="_blank"
                rel="noreferrer"
                href={LINKS.YOUTUBE_TUTORIALS}
                onClick={() => trackTopbarClicked("tutorials")}
              >
                Tutorials
              </a>

              <a
                target="_blank"
                rel="noreferrer"
                href={LINKS.REQUESTLY_DESKTOP_APP}
                onClick={() => trackTopbarClicked("desktop_app")}
              >
                Desktop App <RQBadge badgeText="NEW" />
              </a>
            </div>
          </Col>
        ) : null}

        <Col xs={0} sm={0} md={0} lg={!isPricingOrGoodbyePage ? (isTabletView ? 7 : 9) : 9}>
          <div className="header-middle-section hidden-on-small-screen">
            <HeaderText />
          </div>
        </Col>
        <Col className="ml-auto">
          <div className="header-right-section">
            <Row align="middle" gutter={8} wrap={false}>
              {randomNumberBetween1And2 === 1 ? (
                <Col className="hidden-on-small-screen">
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
                </Col>
              ) : (
                <Col className="hidden-on-small-screen">
                  <span className="join-slack-button" onClick={() => trackHeaderClicked("join_slack_button")}>
                    <Button
                      style={{ display: "flex" }}
                      type="default"
                      size="small"
                      icon={<SlackOutlined />}
                      onClick={() => window.open("https://bit.ly/requestly-slack", "_blank")}
                    >
                      Join Slack Community
                    </Button>
                  </span>
                </Col>
              )}

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
                      redirectToSettings(navigate);
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
  ) : null;
};

export default MenuHeader;
