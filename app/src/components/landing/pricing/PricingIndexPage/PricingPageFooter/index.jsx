import React, { useState } from "react";
import { Row, Col, Typography, Space } from "antd";
import { EVENTS, trackRequestDocumentClicked } from "./analytics";
import RequestDocsModal from "./RequestDocsModal";
import { getFunctions, httpsCallable } from "firebase/functions";

const { Title, Text, Link } = Typography;

const styles = {
  footer: {
    padding: "40px 20px",
  },
  container: {
    maxWidth: "70vw",
    margin: "0 auto",
  },
  title: {},
  companyInfo: {
    marginTop: "20px",
    textAlign: "center",
    color: "var(--neutrals-gray-300)",
  },
};

const PricingPageFooter = () => {
  const [isRequestDocsModalOpen, setisRequestDocsModalOpen] = useState(false);

  const handleDocRequiredOnClick = () => {
    trackRequestDocumentClicked();
    const salesInboundNotification = httpsCallable(getFunctions(), "salesInboundNotification");
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
    <>
      <div style={styles.footer}>
        <div style={styles.container}>
          <Row justify="space-between" align="top" gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Title level={4} style={styles.title}>
                Get Requestly
              </Title>
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
              <Title level={4} style={styles.title}>
                Resources
              </Title>
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
              <Title level={4} style={styles.title}>
                More Resources
              </Title>
              <Space direction="vertical">
                <Link onClick={handleDocRequiredOnClick}>SOC 2 Report</Link>
                <Link onClick={handleDocRequiredOnClick}>Pen testing Report</Link>
                <Link onClick={handleDocRequiredOnClick}>W9 Form</Link>
                <Link onClick={handleDocRequiredOnClick}>Data Processing Agreement (DPA)</Link>
                <Link onClick={handleDocRequiredOnClick}>Request GDPR Data Removal </Link>
              </Space>
            </Col>
            <Col xs={24} md={6}>
              <Title level={4} style={styles.title}>
                Comparisons
              </Title>
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
          <Row justify="center" style={styles.companyInfo}>
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
    </>
  );
};

export default PricingPageFooter;
