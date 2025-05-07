import React, { useState } from "react";
import { Row, Col, Typography, Space, Button } from "antd";
import { EVENTS, trackAddToChromeClicked, trackRequestDocumentClicked } from "./analytics";
import RequestDocsModal from "./RequestDocsModal";
import { getFunctions, httpsCallable } from "firebase/functions";
import LINKS from "config/constants/sub/links";
import { useIsBrowserStackIntegrationOn } from "hooks/useIsBrowserStackIntegrationOn";
import "./PricingPageFooter.scss";
import { getLinkWithMetadata } from "modules/analytics/metadata";

const { Title, Link } = Typography;

const PricingPageFooter: React.FC = () => {
  const [isRequestDocsModalOpen, setisRequestDocsModalOpen] = useState(false);
  const isBrowserStackIntegrationOn = useIsBrowserStackIntegrationOn();

  const handleDocRequiredOnClick = () => {
    trackRequestDocumentClicked();
    const salesInboundNotification = httpsCallable(getFunctions(), "premiumNotifications-salesInboundNotification");
    try {
      salesInboundNotification({
        notificationText: EVENTS.REQUEST_DOCUEMNT_CLICKED,
      });
    } catch (error) {
      console.error(error);
    }
    setisRequestDocsModalOpen(true);
  };

  return (
    <div className="pricing-page-footer">
      <div className="footer">
        <img
          className="mascot"
          width={290}
          height={208}
          src={"/assets/media/pricing/mascot.svg"}
          alt="Requestly mascot"
        />
        <div className="header">
          <div className="rq-logo-container">
            <img
              className="rq-logo"
              width={200}
              height={48}
              src={`/assets/media/common/${isBrowserStackIntegrationOn ? "RQ-BStack Logo.svg" : "rq_logo_full.svg"}`}
              alt="Requestly logo"
            />
            <div className="caption">
              Loved by <span className="highlight">200,000+</span> developers at{" "}
              <span className="highlight">10,000+</span> companies
            </div>
          </div>
          <div className="add-to-chrome-container">
            <span className="get-started">Get started</span>
            <Button
              type="primary"
              className="add-to-chrome-btn"
              onClick={() => {
                trackAddToChromeClicked("pricing_page");
                window.open(LINKS.CHROME_EXTENSION, "_blank");
              }}
            >
              <img
                width={17}
                height={17}
                src={"/assets/media/pricing/chrome.svg"}
                alt="Chrome"
                className="chrome-logo"
              />{" "}
              Add to chrome
            </Button>
          </div>
        </div>
        <div className="content">
          <Row className="links-container" justify="space-between" align="top" gutter={[16, 16]}>
            <Col xs={24} md={4}>
              <Title className="title" level={4}>
                Get
              </Title>
              <Space direction="vertical">
                <Link target="_blank" href={getLinkWithMetadata("https://requestly.com/desktop/")}>
                  Desktop app
                </Link>
                <Link target="_blank" href={getLinkWithMetadata("https://requestly.com/downloads/chrome/")}>
                  Chrome Extension
                </Link>
                <Link target="_blank" href={getLinkWithMetadata("https://requestly.com/downloads/edge/")}>
                  Edge Addon
                </Link>
                <Link
                  target="_blank"
                  href={getLinkWithMetadata("https://requestly.com/integrations/requestly-for-selenium/")}
                >
                  Selenium Addon
                </Link>
                <Link target="_blank" href={getLinkWithMetadata("https://requestly.com/downloads/for-safari/")}>
                  For Safari
                </Link>
              </Space>
            </Col>
            <Col xs={24} md={4}>
              <Title className="title" level={4}>
                Features
              </Title>
              <Space direction="vertical">
                <Link
                  target="_blank"
                  href={getLinkWithMetadata("https://requestly.com/products/web-debugger/redirect-rule/")}
                >
                  Redirect URL
                </Link>
                <Link
                  target="_blank"
                  href={getLinkWithMetadata("https://requestly.com/products/web-debugger/replace-rule-switch-hosts/")}
                >
                  Replace Rule
                </Link>
                <Link
                  target="_blank"
                  href={getLinkWithMetadata(
                    "https://requestly.com/products/web-debugger/best-chrome-extension-to-inject-javascript-and-css-on-any-webpage/"
                  )}
                >
                  Insert Custom Script
                </Link>
                <Link
                  target="_blank"
                  href={getLinkWithMetadata("https://requestly.com/products/modify-and-mock-graphql-apis/")}
                >
                  Override GraphQL APIs
                </Link>
                <Link
                  target="_blank"
                  href={getLinkWithMetadata("https://requestly.com/products/web-debugger/modify-http-headers/")}
                >
                  Modify HTTP Headers
                </Link>
                <Link
                  target="_blank"
                  href={getLinkWithMetadata(
                    "https://requestly.com/products/web-debugger/intercept-modify-mock-api-responses-test-develop-like-an-expert/"
                  )}
                >
                  Modify API Response
                </Link>
                <Link
                  target="_blank"
                  href={getLinkWithMetadata("https://requestly.com/products/web-debugger/delay-http-request/")}
                >
                  Delay request
                </Link>
                <Link
                  target="_blank"
                  href={getLinkWithMetadata("https://requestly.com/products/web-debugger/cross-device-testing/")}
                >
                  Cross Device Testing
                </Link>
              </Space>
            </Col>
            <Col xs={24} md={4}>
              <Title className="title" level={4}>
                Comparisons
              </Title>
              <Space direction="vertical">
                <Link
                  href={getLinkWithMetadata("https://requestly.com/alternatives/a-better-alternate-to-charles-proxy/")}
                >
                  Charles Proxy VS Requestly
                </Link>
                <Link href={getLinkWithMetadata("https://requestly.com/alternatives/fiddler/")}>
                  Fiddler VS Requestly
                </Link>
                <Link
                  href={getLinkWithMetadata(
                    "https://requestly.com/alternatives/a-better-and-well-documented-alternate-to-modheader/"
                  )}
                >
                  ModHeader VS Requestly
                </Link>
                <Link href={getLinkWithMetadata("https://requestly.com/alternatives/proxyman/")}>
                  Proxyman VS Requestly
                </Link>
                <Link href={getLinkWithMetadata("https://requestly.com/alternatives/wireshark/")}>
                  WireShark VS Requestly
                </Link>
              </Space>
            </Col>
            <Col xs={24} md={4}>
              <Title className="title" level={4}>
                Resources
              </Title>
              <Space direction="vertical">
                <Link target="_blank" href={getLinkWithMetadata("https://requestly.com/privacy/")}>
                  Privacy Policy
                </Link>
                <Link target="_blank" href={getLinkWithMetadata("https://requestly.com/terms/")}>
                  Terms of Service
                </Link>
                <Link target="_blank" href={getLinkWithMetadata("https://requestly.com/blog/")}>
                  Blog
                </Link>
                <Link target="_blank" href="https://docs.requestly.com/">
                  Documentation
                </Link>
                <Link
                  target="_blank"
                  href="https://join.slack.com/t/requestlycommunity/shared_invite/zt-2kctky1mb-vZoBrCbChUKwaL9DUPehsA"
                >
                  Slack Community
                </Link>
              </Space>
            </Col>
            <Col xs={24} md={4}>
              <Title className="title" level={4}>
                Compliance & Security
              </Title>
              <Space direction="vertical">
                <Link onClick={handleDocRequiredOnClick}>SOC 2 Report</Link>
                <Link onClick={handleDocRequiredOnClick}>Pen testing Report</Link>
                <Link onClick={handleDocRequiredOnClick}>W9 Form</Link>
                <Link onClick={handleDocRequiredOnClick}>Data Processing Agreement (DPA)</Link>
                <Link onClick={handleDocRequiredOnClick}>Request GDPR Data Removal </Link>
              </Space>
            </Col>
          </Row>

          <div className="socials-continer">
            <div className="copyright">Copyright © 2025 BrowserStack. All rights reserved.</div>

            <div className="socials">
              <span className="follow-us">Follow us on</span>
              <Link href="https://medium.com/requestly" target="_blank">
                <img width={48} height={48} src={"/assets/media/pricing/medium-logo.svg"} alt="Medium logo" />
              </Link>
              <Link href="https://twitter.com/requestlyio?lang=en" target="_blank">
                <img width={48} height={48} src={"/assets/media/pricing/twitter-logo.svg"} alt="Twitter logo" />
              </Link>
              <Link href="https://www.linkedin.com/company/requestly" target="_blank">
                <img width={48} height={48} src={"/assets/media/pricing/linkedin-logo.svg"} alt="LinkedIn logo" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <RequestDocsModal
        isOpen={isRequestDocsModalOpen}
        handleToggleModal={() => {
          setisRequestDocsModalOpen(!isRequestDocsModalOpen);
        }}
      />
    </div>
  );
};

export default PricingPageFooter;
