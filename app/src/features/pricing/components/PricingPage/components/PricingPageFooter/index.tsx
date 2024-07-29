import React, { useState } from "react";
import { Row, Col, Typography, Space, Button } from "antd";
import { EVENTS, trackAddToChromeClicked, trackRequestDocumentClicked } from "./analytics";
import RequestDocsModal from "./RequestDocsModal";
import { getFunctions, httpsCallable } from "firebase/functions";
import backedBy from "./assets/backed-by.png";
import RQLogo from "assets/img/brand/rq_logo_full.svg";
import ChromeLogo from "./assets/chrome.svg";
import Mascot from "./assets/mascot.svg";
import LINKS from "config/constants/sub/links";
import "./PricingPageFooter.scss";

const { Title, Text, Link } = Typography;

const PricingPageFooter: React.FC = () => {
  const [isRequestDocsModalOpen, setisRequestDocsModalOpen] = useState(false);

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
      <div className="banner">
        <img className="backed-by" width={880} height={142} src={backedBy} alt="Backed by the best" />
      </div>
      <div className="footer">
        <img className="mascot" width={290} height={208} src={Mascot} alt="Requestly mascot" />
        <div className="header">
          <div className="rq-logo-container">
            <img className="rq-logo" width={200} height={48} src={RQLogo} alt="Requestly logo" />
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
              <img width={17} height={17} src={ChromeLogo} alt="Chrome" className="chrome-logo" /> Add to chrome
            </Button>
          </div>
        </div>
        <div className="content">
          <Row justify="space-between" align="top" gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Title level={4}>Get Requestly</Title>
              <Space direction="vertical">
                <Link target="_blank" href="https://requestly.com/desktop/">
                  Desktop app
                </Link>
                <Link target="_blank" href="https://requestly.com/downloads/chrome/">
                  Chrome Extension
                </Link>
                <Link target="_blank" href="https://requestly.com/downloads/edge/">
                  Edge Addon
                </Link>
                <Link target="_blank" href="https://requestly.com/integrations/requestly-for-selenium/">
                  Selenium Addon
                </Link>
                <Link target="_blank" href="https://requestly.com/downloads/for-safari/">
                  For Safari
                </Link>
              </Space>
            </Col>
            <Col xs={24} md={6}>
              <Title level={4}>Resources</Title>
              <Space direction="vertical">
                <Link target="_blank" href="https://requestly.com/privacy/">
                  Privacy Policy
                </Link>
                <Link target="_blank" href="https://requestly.com/terms/">
                  Terms of Service
                </Link>
                <Link target="_blank" href="https://requestly.com/blog/">
                  Blog
                </Link>
                <Link target="_blank" href="https://developers.requestly.com/">
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
            <Col xs={24} md={6}>
              <Title level={4}>More Resources</Title>
              <Space direction="vertical">
                <Link onClick={handleDocRequiredOnClick}>SOC 2 Report</Link>
                <Link onClick={handleDocRequiredOnClick}>Pen testing Report</Link>
                <Link onClick={handleDocRequiredOnClick}>W9 Form</Link>
                <Link onClick={handleDocRequiredOnClick}>Data Processing Agreement (DPA)</Link>
                <Link onClick={handleDocRequiredOnClick}>Request GDPR Data Removal </Link>
              </Space>
            </Col>
            <Col xs={24} md={6}>
              <Title level={4}>Comparisons</Title>
              <Space direction="vertical">
                <Link href="https://requestly.com/alternatives/a-better-alternate-to-charles-proxy/">
                  Charles Proxy VS Requestly
                </Link>
                <Link href="https://requestly.com/alternatives/fiddler/">Fiddler VS Requestly</Link>
                <Link href="https://requestly.com/alternatives/a-better-and-well-documented-alternate-to-modheader/">
                  MohHeader VS Requestly
                </Link>
                <Link href="https://requestly.com/alternatives/proxyman/">Proxyman VS Requestly</Link>
                <Link href="https://requestly.com/alternatives/wireshark/">WireShark VS Requestly</Link>
              </Space>
            </Col>
          </Row>
          <br />
          <Row justify="center">
            <Col xs={24} md={18}>
              <Text>&copy; 2024 RQ Labs, Inc. All Rights Reserved.</Text>
              <br />
              <Text>355 Braynt St, Unit 403, San Francisco, CA</Text>
              <br />
              <Text>Email: contact@requestly.io | Phone: (302) 476-2431</Text>
              <br />
              <Text>DUNS Number: 11-877-3057</Text>
              <br />
              <Text>Tax ID: 87-3981979</Text>
            </Col>
          </Row>
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
