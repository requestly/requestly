import React, { useMemo } from "react";
import { Typography, Row, Col } from "antd";
import { ReadOutlined, CalendarOutlined, ApiOutlined } from "@ant-design/icons";
import { FaYCombinator } from "@react-icons/all-files/fa/FaYCombinator";
import { redirectToUrl } from "utils/RedirectionUtils";
import APP_CONSTANTS from "config/constants";
import { Footer } from "antd/lib/layout/layout";
import { trackFooterClicked } from "modules/analytics/events/common/onboarding/footer";
import { getExtensionVersion, isExtensionInstalled } from "actions/ExtensionActions";
import "./Footer.css";
import { getAppVersion, isAppInstalled } from "actions/DesktopActions";

const { Text } = Typography;

const AppFooter: React.FC = () => {
  const SHOW_YC_BRANDING = false;

  const footerLinksConfig = useMemo(
    () => ({
      "Book a demo": {
        link: APP_CONSTANTS.LINKS.BOOK_A_DEMO,
        icons: <CalendarOutlined />,
      },
      Documentation: {
        link: APP_CONSTANTS.LINKS.REQUESTLY_DOCS,
        icons: <ReadOutlined />,
      },
      "API documentation": {
        link: APP_CONSTANTS.LINKS.REQUESTLY_API_DOCS,
        icons: <ApiOutlined />,
      },
    }),
    []
  );
  const renderFooterLinks = () => {
    return (
      <div className="app-footer-links">
        {Object.entries(footerLinksConfig).map(([key, { link, icons }]) => (
          <Text
            key={key}
            className="cursor-pointer"
            onClick={() => {
              trackFooterClicked(key);
              redirectToUrl(link, true);
            }}
          >
            <span className="icon__wrapper">{icons}</span>
            {key}
          </Text>
        ))}
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
          <div className="display-flex items-center">
            {isExtensionInstalled() && <span className="extension-version">v{getExtensionVersion()}</span>}
            {isAppInstalled() && <span className="extension-version">v{getAppVersion()}</span>}
          </div>

          <Col className="ml-auto">{SHOW_YC_BRANDING ? renderYCBranding() : renderFooterLinks()}</Col>
        </Row>
      </Footer>
    </>
  );
};

export default AppFooter;
