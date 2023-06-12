import React from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Row, Col, Button, Tooltip } from "antd";
import { MessageOutlined, NotificationOutlined, PicRightOutlined, ReadOutlined } from "@ant-design/icons";
import { FaYCombinator } from "react-icons/fa";
import { redirectToProductUpdates, redirectToUrl } from "utils/RedirectionUtils";
import APP_CONSTANTS from "config/constants";
import { Footer } from "antd/lib/layout/layout";
import { trackFooterClicked } from "modules/analytics/events/common/onboarding/footer";
import "./Footer.css";

const { Text } = Typography;

interface Props {
  handleSecondarySidebarToggle: (e?: React.MouseEvent) => void;
}

const AppFooter: React.FC<Props> = ({ handleSecondarySidebarToggle = () => {} }) => {
  const navigate = useNavigate();
  const SHOW_YC_BRANDING = false;

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
          <Col md={12} span={24}>
            <Tooltip title="Collapse sidebar" placement="topRight">
              <Button
                type="text"
                icon={<PicRightOutlined />}
                className="footer-sidebar-toggle-btn"
                onClick={(e) => {
                  handleSecondarySidebarToggle();
                  trackFooterClicked("secondary_sidebar_toggle");
                }}
              />
            </Tooltip>
          </Col>
          <Col className="ml-auto">{SHOW_YC_BRANDING ? renderYCBranding() : renderFooterLinks()}</Col>
        </Row>
      </Footer>
    </>
  );
};

export default AppFooter;
