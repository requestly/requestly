import { CheckOutlined, SettingOutlined, YoutubeFilled } from "@ant-design/icons";
import { Button, Divider, Input, Row, Col, Typography } from "antd";
import React, { useState, useCallback } from "react";
import HarImportModal from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/HarImportModal";
import { redirectToNetworkSession } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import InstallExtensionModal from "components/misc/InstallExtensionCTA/Modal";
import "./index.scss";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { trackInstallExtensionDialogShown } from "modules/analytics/events/features/sessionRecording";
import { isExtensionInstalled } from "actions/ExtensionActions";

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

function navigateToSessionSettings() {
  /* dummy */
  // todo: redirect to settings page and add event
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
  const user = useSelector(getUserAuthDetails);

  const [isInstallExtensionModalVisible, setIsInstallExtensionModalVisible] = useState(false);

  const openInstallExtensionModal = useCallback(() => {
    setIsInstallExtensionModalVisible(true);
    trackInstallExtensionDialogShown({ src: "sessions_home_page" });
  }, []);

  const closeModal = useCallback(() => {
    setIsInstallExtensionModalVisible(false);
  }, []);

  const handleStartRecordingBtnClicked = useCallback(() => {
    // todo: change from launchConfig to setting url as session config
    return user?.details?.isLoggedIn ? (isExtensionInstalled() ? launchConfig() : openInstallExtensionModal()) : null;
  }, [launchConfig, openInstallExtensionModal, user?.details?.isLoggedIn]);

  return (
    <div className="onboarding-content-container">
      <Row justify="space-between">
        <Col span={11} className="banner-text-container">
          <Title level={2} className="banner-title">
            Record &amp; replay your first browsing sessions
          </Title>
          <Row>
            <Text type="secondary" className="banner-text">
              <div>
                Safely capture <Text strong>mouse movement</Text>, <Text strong>console</Text>,{" "}
                <Text strong>network</Text> &
              </div>
              <div>
                {" "}
                <Text strong>environment data</Text> automatically on your device for sharing &{" "}
              </div>
              <div> debugging </div>
            </Text>
          </Row>
          <Row className="record-label">
            <Text type="secondary" className="banner-text">
              Record your first session
            </Text>
          </Row>
          <Row>
            <Col span={15} className="input-container">
              <Input placeholder="Enter the URL you want to record" />
            </Col>
            <Col span={3} className="start-btn-container">
              <Button size="middle" type="primary" onClick={handleStartRecordingBtnClicked}>
                {" "}
                Start Recording
              </Button>
            </Col>
          </Row>
        </Col>
        <Col span={13}>
          <Row justify="end" align="middle" className="settings-icon" onClick={navigateToSessionSettings}>
            <SettingOutlined /> &nbsp; <Text underline>Settings</Text>
          </Row>
          <Row justify="center">
            <video // todo: replace with gif
              className="demo-video"
              src="https://www.youtube.com/embed/g_qXQAzUQgU?start=74"
              playsInline
              controls
              preload="auto"
            />
          </Row>
          <Row align="middle" justify="center">
            <a href="https://www.youtube.com/embed/g_qXQAzUQgU?start=74" target="__blank">
              <Row justify="center" align="middle">
                <YoutubeFilled style={{ color: "red", fontSize: 18, marginTop: 4, margin: 0 }} /> &nbsp;
                <Text underline>Watch it in action</Text>
              </Row>
            </a>
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
