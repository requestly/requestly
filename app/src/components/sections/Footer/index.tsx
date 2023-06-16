import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { actions } from "store";
import { Typography, Row, Col, Button, Tooltip } from "antd";
import { getIsSecondarySidebarCollapsed } from "store/selectors";
import { MessageOutlined, NotificationOutlined, PicRightOutlined, ReadOutlined } from "@ant-design/icons";
import { FaYCombinator } from "react-icons/fa";
import { redirectToProductUpdates, redirectToUrl } from "utils/RedirectionUtils";
import APP_CONSTANTS from "config/constants";
import { Footer } from "antd/lib/layout/layout";
import { trackFooterClicked } from "modules/analytics/events/common/onboarding/footer";
import "./Footer.css";

const { Text } = Typography;

const AppFooter: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const SHOW_YC_BRANDING = false;
  const isSecondarySidebarCollapsed = useSelector(getIsSecondarySidebarCollapsed);
  const isSidebarToggleAllowed = useMemo(
    () =>
      [APP_CONSTANTS.PATHS.RULES.INDEX, APP_CONSTANTS.PATHS.MOCK_SERVER.INDEX].some((path) => pathname.includes(path)),
    [pathname]
  );

  const handleSecondarySidebarToggle = (e: React.MouseEvent) => {
    dispatch(actions.updateSecondarySidebarCollapse(!isSecondarySidebarCollapsed));
    trackFooterClicked("secondary_sidebar_toggle");
  };

  const renderFooterLinks = () => {
    return (
      <div className="app-footer-links">
        <Text
          className="cursor-pointer"
          onClick={() => {
            trackFooterClicked("product_updates");
            redirectToProductUpdates(navigate);
          }}
        >
          <span className="icon__wrapper">
            <NotificationOutlined />
          </span>
          Product updates
        </Text>
        <Text
          className="cursor-pointer"
          onClick={() => {
            trackFooterClicked("documentation");
            redirectToUrl(APP_CONSTANTS.LINKS.REQUESTLY_DOCS, true);
          }}
        >
          <span className="icon__wrapper">
            <ReadOutlined />
          </span>
          Documentation
        </Text>
        <Text
          className="cursor-pointer"
          onClick={() => {
            trackFooterClicked("support");
            redirectToUrl(APP_CONSTANTS.LINKS.CONTACT_US_PAGE, true);
          }}
        >
          <span className="icon__wrapper">
            <MessageOutlined />
          </span>
          Support
        </Text>
      </div>
    );
  };

  const renderYCBranding = () => {
    return (
      <Text>
        Backed by{" "}
        <span
          style={{ color: "orange", cursor: "pointer" }}
          onClick={() => window.open("https://twitter.com/ycombinator/status/1468968505596776469", "_blank")}
        >
          <FaYCombinator className="fix-icon-is-up" /> Combinator
        </span>
      </Text>
    );
  };

  return (
    <>
      <Footer className="app-layout-footer">
        <Row align="middle" justify="space-between" className="w-full">
          {isSidebarToggleAllowed && (
            <Col>
              <Tooltip title={`${isSecondarySidebarCollapsed ? "Expand" : "Collapse"} sidebar`} placement="topRight">
                <Button
                  type="text"
                  icon={<PicRightOutlined />}
                  className="footer-sidebar-toggle-btn"
                  onClick={handleSecondarySidebarToggle}
                />
              </Tooltip>
            </Col>
          )}

          <Col className="ml-auto">{SHOW_YC_BRANDING ? renderYCBranding() : renderFooterLinks()}</Col>
        </Row>
      </Footer>
    </>
  );
};

export default AppFooter;
