import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Typography, Row, Col, Dropdown, MenuProps } from "antd";
import { ReadOutlined, CalendarOutlined, ApiOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { FaYCombinator } from "@react-icons/all-files/fa/FaYCombinator";
import { redirectToUrl } from "utils/RedirectionUtils";
import APP_CONSTANTS from "config/constants";
import { Footer } from "antd/lib/layout/layout";
import { trackFooterClicked } from "modules/analytics/events/common/onboarding/footer";
import { getExtensionVersion, isExtensionInstalled } from "actions/ExtensionActions";
import { getAppVersion, isAppInstalled } from "actions/DesktopActions";
import "./Footer.css";

enum FOOTER_LINKS {
  API_DOCUMENTATION = "API Documentation",
  BOOK_A_DEMO = "Book a demo",
  DOCUMENTATION = "Documentation",
}

const { Text } = Typography;
const { PATHS } = APP_CONSTANTS;
const PAGES_WITHOUT_FOOTER = [PATHS.SETTINGS.RELATIVE];

const AppFooter: React.FC = () => {
  const { pathname } = useLocation();
  const SHOW_YC_BRANDING = false;

  const helpItems: MenuProps["items"] = useMemo(() => {
    return [
      {
        label: FOOTER_LINKS.API_DOCUMENTATION,
        key: "API Documentation",
        icon: <ApiOutlined />,
        onClick: () => {
          redirectToUrl(APP_CONSTANTS.LINKS.REQUESTLY_API_DOCS, true);
          trackFooterClicked(FOOTER_LINKS.API_DOCUMENTATION);
        },
      },
      {
        label: FOOTER_LINKS.BOOK_A_DEMO,
        key: "Book a demo",
        icon: <CalendarOutlined />,
        onClick: () => {
          handleFooterLinkClick(APP_CONSTANTS.LINKS.BOOK_A_DEMO, FOOTER_LINKS.BOOK_A_DEMO);
        },
      },
    ];
  }, []);

  const handleFooterLinkClick = (link: string, key: string) => {
    redirectToUrl(link, true);
    trackFooterClicked(key);
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

  if (PAGES_WITHOUT_FOOTER.some((path) => pathname.includes(path))) return null;

  return (
    <>
      <Footer className="app-layout-footer">
        <Row align="middle" justify="space-between" className="w-full">
          <div className="display-flex items-center">
            {isExtensionInstalled() && <span className="extension-version">v{getExtensionVersion()}</span>}
            {isAppInstalled() && <span className="extension-version">v{getAppVersion()}</span>}
          </div>

          <Col className="ml-auto">
            {SHOW_YC_BRANDING ? (
              renderYCBranding()
            ) : (
              <div className="app-footer-links">
                <Text
                  onClick={() => handleFooterLinkClick(APP_CONSTANTS.LINKS.REQUESTLY_DOCS, FOOTER_LINKS.DOCUMENTATION)}
                >
                  <span className="icon__wrapper">
                    <ReadOutlined />
                  </span>
                  Documentation
                </Text>
                <Dropdown trigger={["click"]} menu={{ items: helpItems }}>
                  <Text>
                    <span className="icon__wrapper">
                      <QuestionCircleOutlined />
                    </span>
                    Help
                  </Text>
                </Dropdown>
              </div>
            )}
          </Col>
        </Row>
      </Footer>
    </>
  );
};

export default AppFooter;
