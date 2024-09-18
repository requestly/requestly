import React, { useRef, useEffect, useState } from "react";
import { Button, Input, Row, Col, Typography, InputRef, Space, Modal, message, Spin } from "antd";
import WolfSafeDashboard from "./wolfsafe-dashboard.png";
import WolfSafeIcon from "assets/icons/wolfsafe.svg?react";
import { trackEvent } from "modules/analytics";
import { API_SECURITY_TESTING } from "modules/analytics/events/features/constants";
import { redirectToRules } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { GreenVerifiedCheck } from "views/features/sessions/SessionsIndexPageContainer/SessionsIndexPage/OnboardingView";
import { getFunctions, httpsCallable } from "firebase/functions";

const { Text, Title } = Typography;

const WOLFSAFE_BLUE = "#03a9f4";

interface APISecurityLandingProps {}

const trackAPISecurityLandingPageViewed = (forwardToApollo: Boolean) => {
  trackEvent(API_SECURITY_TESTING.API_SECURITY_TESTING_LANDING_PAGE_VIEWED);
  if (!forwardToApollo) return;

  const captureWolfSafeInterest = httpsCallable(getFunctions(), "wolfsafe-captureWolfSafeInterest");
  try {
    captureWolfSafeInterest({});
  } catch (error) {
    console.error(error);
  }
};

const trackAPISecurityStartPressed = () => trackEvent(API_SECURITY_TESTING.API_SECURITY_TESTING_START_PRESSED);

export const APISecurityLanding: React.FC<APISecurityLandingProps> = () => {
  const inputRef = useRef<InputRef>();
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [email, setEmail] = useState(user.email || ""); // Default email if user is logged in
  const [domain, setDomain] = useState("");
  const [isLoadingModalVisible, setIsLoadingModalVisible] = useState(false);
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);

  const isUserLoggedIn = !!user.loggedIn;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;

  const handleStartOnClick = () => {
    trackAPISecurityStartPressed();

    if (!domainRegex.test(domain)) {
      message.error("Please enter a valid domain.");
      return;
    }

    if (isUserLoggedIn) {
      sendNotification(email, domain);
      triggerLoadingAndAlert();
    } else {
      setIsEmailModalVisible(true);
    }
  };

  const handleEmailSubmit = () => {
    if (!emailRegex.test(email)) {
      message.error("Please enter a valid email address.");
      return;
    }

    console.log("User email:", email);
    setIsEmailModalVisible(false);
    sendNotification(email, domain);
    triggerLoadingAndAlert();
  };

  const sendNotification = (email: string, domain: string) => {
    const apiSecurityInterestNotification = httpsCallable(
      getFunctions(),
      "premiumNotifications-apiSecurityInterestNotification"
    );
    try {
      apiSecurityInterestNotification({
        notificationText: `${API_SECURITY_TESTING.API_SECURITY_TESTING_START_PRESSED} - Email: ${email}, Domain: ${domain}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const triggerLoadingAndAlert = () => {
    setIsLoadingModalVisible(true);

    setTimeout(() => {
      setIsLoadingModalVisible(false);
      setIsAlertModalVisible(true);
    }, 3000);
  };

  const handleAlertOk = () => {
    setIsAlertModalVisible(false);
    redirectToRules(navigate);
  };

  useEffect(() => {
    trackAPISecurityLandingPageViewed(isUserLoggedIn);
  }, []);

  return (
    <div
      className="onboarding-content-container"
      style={{
        background: "#1A1A1A",
        height: "100%",
      }}
    >
      <Row justify="end" align="middle" className="settings-row">
        <Space size={20}></Space>
      </Row>

      <Row justify="space-between" className="onboarding-banner">
        <Col span={11} className="banner-text-container">
          <Row className="banner-header">
            <Title className="banner-title">
              <span style={{ color: WOLFSAFE_BLUE, fontWeight: "bold" }}>One Platform</span>
              <br /> <span style={{ fontWeight: "bold" }}> To Secure Every API </span>
            </Title>
          </Row>
          <Row className="banner-description">
            <Text type="secondary" className="banner-text w-full">
              <div>
                <Text strong> Discover, protect, and test</Text> all your APIs with{" "}
                <Text strong style={{ color: WOLFSAFE_BLUE }}>
                  <WolfSafeIcon height={"1rem"} /> WolfSafe<sup>&reg;</sup>
                </Text>
              </div>
              <br />
              <div>
                {" "}
                Continuously discover APIs across 1000s of apps -{" "}
                <Text strong>Internal, Public and Third Party APIs, sensitive, zombie and shadow APIs.</Text>
              </div>
            </Text>

            <Text type="secondary" className="banner-message banner-text">
              <GreenVerifiedCheck /> Shift Left API security testing - OWASP API Top 10, Authentication, Authorization &
              business logic testing.
            </Text>
          </Row>
          <Col span={24}>
            <Row className="record-label">
              <Text type="secondary" className="banner-text">
                Start by capturing live API traffic
              </Text>
            </Row>
            <Row>
              <Col span={15} className="input-container">
                <Input
                  ref={inputRef}
                  placeholder="Enter your domain eg. amazon.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  onPressEnter={handleStartOnClick}
                />
              </Col>
              <Col span={3} className="start-btn-container">
                <Button size="middle" type="primary" onClick={handleStartOnClick}>
                  Start
                </Button>
              </Col>
            </Row>
          </Col>
        </Col>

        <Col span={13} className="banner-demo-video">
          <Row justify="end">
            <img
              src={WolfSafeDashboard}
              alt="WolfSafe dashboard"
              style={{
                border: "1px solid #2a3a5f",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                maxWidth: "100%",
                height: "auto",
              }}
              className="demo-video"
            />
          </Row>
        </Col>
      </Row>

      {/* Modal for Email Input */}
      <Modal
        title="Please enter your work email"
        visible={isEmailModalVisible}
        onOk={handleEmailSubmit}
        cancelButtonProps={{ style: { display: "none" } }} // Hide the cancel button
        okText="Start"
      >
        <Input
          placeholder="eg. sam@amazon.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onPressEnter={handleEmailSubmit}
        />
      </Modal>

      {/*  Loading Modal */}
      <Modal
        title="Fetching..."
        visible={isLoadingModalVisible}
        footer={null} // Hide footer buttons
        closable={false} // Prevent closing the modal
      >
        <div style={{ textAlign: "center" }}>
          <Spin size="large" />
          <p>Please wait while we fetch all the APIs...</p>
        </div>
      </Modal>

      {/* Alert Modal */}
      <Modal
        title="Feature Not Enabled"
        visible={isAlertModalVisible}
        onOk={handleAlertOk}
        cancelButtonProps={{ style: { display: "none" } }} // Hide the cancel button
        okText="Ok"
      >
        <p>
          Looks like your organisation has not enabled this feature yet. Someone from our team will get in touch with
          you via email to assist further.
        </p>
      </Modal>
    </div>
  );
};

export default APISecurityLanding;
