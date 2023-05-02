import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Button, Row, Col, Tooltip, Dropdown, Menu, Divider } from "antd";
import { RiMenuFill } from "react-icons/ri";
import HeaderUser from "./HeaderUser";
import HeaderText from "./HeaderText";
import LINKS from "config/constants/sub/links";
import RulesSyncToggle from "../../../components/sections/Navbars/NavbarRightContent/RulesSyncToggle";
import { isPricingPage, isGoodbyePage, isInvitePage } from "utils/PathUtils";
import {
  GithubOutlined,
  NotificationOutlined,
  PhoneOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  SlackOutlined,
  SnippetsOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import { redirectToSettings, redirectToProductUpdates } from "utils/RedirectionUtils";
import { RQBreadcrumb } from "lib/design-system/components";
import GitHubButton from "react-github-btn";
import { useMediaQuery } from "react-responsive";
import { ReactComponent as Settings } from "assets/icons/settings.svg";
import { trackHeaderClicked, trackHelpdeskClicked } from "modules/analytics/events/common/onboarding/header";
import "./MenuHeader.css";

const { Header } = Layout;

const MenuHeader = ({ setVisible, setCollapsed }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isTabletView = useMediaQuery({ query: "(max-width: 1200px)" });
  const isMyRulesPage = pathname.includes("my-rules");
  const isPricingOrGoodbyePage = isPricingPage() || isGoodbyePage() || isInvitePage();
  const editorPaths = [
    "/rules/editor",
    "/mocks/editor",
    "/filesv2/editor",
    "/mock-server/viewer",
    "/pricing",
    "/invite",
  ];

  const showMenuHeader = () => {
    //don't show general app header component for editor screens
    for (let path of editorPaths) {
      if (pathname.includes(path)) return false;
    }
    return true;
  };

  // Mobile Sidebar
  const showDrawer = () => {
    setCollapsed(false);
    setVisible(true);
  };

  const helpMenu = (
    <Menu className="header-help-menu-container" onClick={({ key }) => trackHelpdeskClicked(key)}>
      <Menu.Item key="github">
        <a href={LINKS.REQUESTLY_GITHUB_ISSUES} target="_blank" rel="noreferrer">
          <GithubOutlined /> <span>Github</span>
        </a>
      </Menu.Item>
      <Divider className="header-help-menu-divider" />
      <Menu.Item key="documentation">
        <a href={LINKS.REQUESTLY_DOCS} target="_blank" rel="noreferrer">
          <ReadOutlined />
          <span>Documentation</span>
        </a>
      </Menu.Item>
      <Menu.Item key="how_to_articles">
        <a href={LINKS.REQUESTLY_BLOG} target="_blank" rel="noreferrer">
          <SnippetsOutlined />
          <span>How to articles</span>
        </a>
      </Menu.Item>
      <Menu.Item key="video_tutorials">
        <a href={LINKS.YOUTUBE_TUTORIALS} target="_blank" rel="noreferrer">
          <YoutubeOutlined />
          <span>Video tutorials</span>
        </a>
      </Menu.Item>
      <Divider className="header-help-menu-divider" />
      <Menu.Item key="support">
        <a href={LINKS.CONTACT_US_PAGE} target="_blank" rel="noreferrer">
          <PhoneOutlined rotate={180} />
          <span>Support</span>
        </a>
      </Menu.Item>
    </Menu>
  );

  const randomNumberBetween1And2 = Math.floor(Math.random() * 2) + 1;

  return showMenuHeader() ? (
    <Header className="layout-header">
      <Row justify="center" className="w-full" wrap={false}>
        <Col span={24}>
          <Row wrap={false} align="middle" className="w-full">
            <Col span={isTabletView ? 1 : 0} flex="0 0 32px">
              {/* if pricing or goodbye page then replace the menu button with logo */}
              {isPricingOrGoodbyePage ? null : (
                <Button
                  className="mobile-sidebar-btn hamburger-menu"
                  type="text"
                  onClick={showDrawer}
                  icon={<RiMenuFill size={24} />}
                />
              )}
            </Col>

            {!isPricingOrGoodbyePage ? (
              <Col span={4} flex="1 1">
                <div className="header-left-section hidden-on-small-screen">
                  {!isMyRulesPage && (
                    <Button
                      type="text"
                      className="header-icon-btn"
                      icon={<img alt="back" width="14px" height="12px" src="/assets/icons/leftArrow.svg" />}
                      onClick={() => navigate(-1)}
                    />
                  )}

                  <RQBreadcrumb />
                </div>
              </Col>
            ) : null}

            <Col xs={0} sm={0} md={0} lg={!isPricingOrGoodbyePage ? (isTabletView ? 11 : 14) : 16}>
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
                  <div className="hidden-on-small-screen" onClick={() => trackHeaderClicked("syncing")}>
                    <RulesSyncToggle />
                  </div>
                  {/* info */}
                  {/* <Col className="hidden-on-small-screen">
                    <Dropdown
                      trigger={["click"]}
                      menu={helpMenu}
                      placement="bottomRight"
                      onOpenChange={(open) => {
                        open && trackHeaderClicked("helpdesk");
                      }}
                    >
                      <Button type="text" className="header-icon-btn" icon={<QuestionCircleOutlined />} />
                    </Dropdown>
                  </Col> */}

                  {/* product updates */}
                  <Col className="hidden-on-small-screen">
                    <Tooltip title={<span className="text-gray text-sm">Product updates</span>}>
                      <Button
                        type="text"
                        className="header-icon-btn"
                        icon={<NotificationOutlined />}
                        onClick={() => {
                          trackHeaderClicked("product_updates");
                          redirectToProductUpdates(navigate);
                        }}
                      />
                    </Tooltip>
                  </Col>

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
        </Col>
      </Row>
    </Header>
  ) : null;
};

export default MenuHeader;
