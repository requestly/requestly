import { CheckOutlined, SettingOutlined, YoutubeFilled } from "@ant-design/icons";
import { Button, Divider, Input, Row, Col, Typography } from "antd";
import React, { useState, useCallback } from "react";
import HarImportModal from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/HarImportModal";
import { redirectToNetworkSession } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import InstallExtensionModal from "components/misc/InstallExtensionCTA/Modal";
import "./index.scss";

const { Text, Title } = Typography;

const CheckItem: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div>
      <CheckOutlined style={{ marginRight: "8px", fontSize: "16px", color: "#228B22" }} />
      <span>{label}</span>
    </div>
  );
};

interface SessionOnboardProps {
  launchConfig?: () => void;
}

export enum OnboardingTypes {
  NETWORK,
  SESSIONS,
}
interface OnboardingProps extends SessionOnboardProps {
  type?: OnboardingTypes;
}

const NewtorkSessionsOnboarding: React.FC<{}> = () => {
  const navigate = useNavigate();
  const stableNavigate = useCallback(
    (sessionId: string) => {
      redirectToNetworkSession(navigate, sessionId);
    },
    [navigate]
  );
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        height: "100%",
        margin: "30px",
      }}
    >
      <Title level={1}>Record &amp; Replay your browsing sessions</Title>
      <Text type="secondary">
        <div>Record your network sessions and Share with others for offline review or debugging.</div>
      </Text>
      <div>
        <HarImportModal onSaved={stableNavigate} />
      </div>
      <Divider />
      <Text type="secondary">
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            fontWeight: "bold",
          }}
        >
          <CheckItem label="Faster Debugging" />
          <CheckItem label="No need to reproduce" />
          <CheckItem label="Strict Privacy" />
        </div>
      </Text>
    </div>
  );
};

const SessionOnboardingView: React.FC<SessionOnboardProps> = ({ launchConfig }) => {
  const [isInstallExtensionModalVisible, setIsInstallExtensionModalVisible] = useState(false);

  const closeModal = useCallback(() => {
    setIsInstallExtensionModalVisible(false);
  }, []);

  return (
    <div className="onboarding-content-container">
      <Row justify="space-between">
        <Col>
          <Title level={2}>Record &amp; replay your first browsing sessions</Title>
        </Col>
        <Col>
          <SettingOutlined /> &nbsp; <Text underline>Settings</Text>
        </Col>
      </Row>
      <Row>
        <Col span={12} className="banner-text-container">
          <Row>
            <Text type="secondary" className="banner-text">
              <div>
                Safely capture <Text strong>mouse movement</Text>, <Text strong>console</Text>,{" "}
                <Text strong>network</Text> and <Text strong>environment data</Text>
              </div>
              <div> automatically on your device for sharing and debugging</div>
            </Text>
          </Row>
          <Row className="record-label">
            <Text type="secondary" className="banner-text">
              Record your first session
            </Text>
          </Row>
          <Row>
            <Col span={18}>
              <Input placeholder="Enter the URL you want to record" />
            </Col>
            <Col span={6} className="start-btn-container">
              <Button size="large" type="primary">
                {" "}
                Start Recording
              </Button>
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row justify="center">
            <video
              className="demo-video"
              src="https://www.youtube.com/embed/g_qXQAzUQgU?start=74"
              playsInline
              controls
              preload="auto"
            />
          </Row>
          <Row align="middle" justify="center">
            <YoutubeFilled style={{ color: "red", fontSize: 18, marginTop: 4, margin: 0 }} /> &nbsp;
            <Text underline>Watch it in action</Text>
          </Row>
        </Col>
      </Row>

      <Divider />
      <Row>
        <Col span={24}>
          <Text type="secondary">
            <Row justify="space-evenly">
              <CheckItem label="Automatically record specified website or all activity" />
              <CheckItem label="All recordings are saved locally until saved or shared" />
              <CheckItem label="View network, console and environment details synced to video" />
            </Row>
          </Text>
        </Col>
      </Row>
      <InstallExtensionModal
        open={isInstallExtensionModalVisible}
        onCancel={closeModal}
        heading="Install Browser extension to record sessions for faster debugging and bug reporting"
        subHeading="Safely capture mouse movement, console, network & environment data automatically on your device for sharing and debugging. Private and secure, works locally on your browser."
        eventPage="session_recording_page"
      />
    </div>
  );
};

const OnboardingView: React.FC<OnboardingProps> = ({ type, launchConfig }) => {
  if (type === OnboardingTypes.NETWORK) {
    return <NewtorkSessionsOnboarding />;
  } else {
    return <SessionOnboardingView launchConfig={launchConfig} />;
  }
};

export default OnboardingView;
