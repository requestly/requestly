import { Typography, Row, Col, Space } from "antd";
import { useNavigate } from "react-router-dom";
import {
  redirectToGDPRPage,
  redirectToPrivacyPolicy,
} from "utils/RedirectionUtils";
import APP_CONSTANTS from "config/constants";
import { Footer } from "antd/lib/layout/layout";
import { FaYCombinator } from "react-icons/fa";

const { Text } = Typography;

const MenuFooter = () => {
  const renderFooterLinks = () => {
    return (
      <Space size={"large"}>
        <Text
          className="cursor-pointer"
          onClick={() =>
            window.open(APP_CONSTANTS.LINKS.CONTACT_US_PAGE, "_blank")
          }
        >
          Support
        </Text>
        <Text
          className="cursor-pointer"
          onClick={() => redirectToPrivacyPolicy(navigate, { newTab: true })}
        >
          Privacy Policy
        </Text>

        <Text
          className="cursor-pointer"
          onClick={() => redirectToGDPRPage(navigate, { newTab: true })}
        >
          GDPR
        </Text>
        <Text
          className="cursor-pointer"
          onClick={() =>
            window.open(APP_CONSTANTS.LINKS.CONTACT_US_PAGE, "_blank")
          }
        >
          Contact Us
        </Text>
      </Space>
    );
  };

  const renderYCBranding = () => {
    return (
      <Text>
        Backed by{" "}
        <span
          style={{ color: "orange", cursor: "pointer" }}
          onClick={() =>
            window.open(
              "https://twitter.com/ycombinator/status/1468968505596776469",
              "_blank"
            )
          }
        >
          <FaYCombinator className="fix-icon-is-up" /> Combinator
        </span>
      </Text>
    );
  };

  const navigate = useNavigate();
  const SHOW_YC_BRANDING = false;

  return (
    <>
      <Footer style={{ padding: "18px 32px" }} className="dark-bg-footer">
        <Row align="middle" justify="space-between">
          <Col md={12} span={24}>
            <p className="dark-bg-footer">
              © 2023{" "}
              <a
                className="font-weight-bold ml-1 dark-bg-footer"
                href="https://requestly.io"
                rel="noopener noreferrer"
                target="_blank"
              >
                RQ Labs, Inc.
              </a>
            </p>
          </Col>

          <Col md={12} span={24} className="dark-bg-footer" align="right">
            {SHOW_YC_BRANDING ? renderYCBranding() : renderFooterLinks()}
          </Col>
        </Row>
      </Footer>
    </>
  );
};

export default MenuFooter;
