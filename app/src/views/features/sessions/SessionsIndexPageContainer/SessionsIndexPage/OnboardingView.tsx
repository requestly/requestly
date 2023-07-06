import { CheckOutlined, SettingOutlined, YoutubeFilled } from "@ant-design/icons";
import { Button, Divider, Input, Row, Col, Typography, InputRef } from "antd";
import React, { useState, useCallback, useRef } from "react";
import HarImportModal from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/HarImportModal";
import { redirectToNetworkSession } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import InstallExtensionModal from "components/misc/InstallExtensionCTA/Modal";
import "./index.scss";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import {
  trackInstallExtensionDialogShown,
  trackOnboardingToSettingsNavigate,
  trackOnboardingYTVideoClicked,
  trackStartRecordingOnExternalTarget,
  trackStartRecordingWithURLClicked,
  trackTriedRecordingForInvalidURL,
} from "modules/analytics/events/features/sessionRecording";
import { isExtensionInstalled, startRecordingOnUrl } from "actions/ExtensionActions";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import TutorialButton from "./TutorialButton";
import { AUTH } from "modules/analytics/events/common/constants";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { isValidUrl } from "utils/FormattingHelper";
import { toast } from "utils/Toast";

import StartSessionRecordingGif from "assets/img/screenshots/session-recording-onboarding.gif";

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
  redirectToSettingsPage?: () => void;
}

export enum OnboardingTypes {
  NETWORK,
  SESSIONS,
}
interface OnboardingProps extends SessionOnboardProps {
  type?: OnboardingTypes;
}

function navigateToSessionSettings() {
  // todo: redirect to settings page and add event
  console.info("todo: will add navigation once settings page is deployed");
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

const OldSessionOnboardingView: React.FC<SessionOnboardProps> = ({ redirectToSettingsPage }) => {
  const [isInstallExtensionModalVisible, setIsInstallExtensionModalVisible] = useState(false);
  const openInstallExtensionModal = useCallback(() => {
    setIsInstallExtensionModalVisible(true);
    trackInstallExtensionDialogShown();
  }, []);

  const closeModal = useCallback(() => {
    setIsInstallExtensionModalVisible(false);
  }, []);

  const user = useSelector(getUserAuthDetails);

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
      <Typography.Title level={1}>Record &amp; Replay your browsing sessions</Typography.Title>
      <Typography.Text type="secondary">
        <div>Record your browsing sessions on specified domains (or webpages)</div>
        <div>and Share with others for offline review or debugging.</div>
      </Typography.Text>
      <div>
        <AuthConfirmationPopover
          title="You need to sign up to configure webpages"
          callback={isExtensionInstalled() ? redirectToSettingsPage : openInstallExtensionModal}
          source={AUTH.SOURCE.SESSION_RECORDING}
        >
          <Button
            type="primary"
            onClick={
              user?.details?.isLoggedIn
                ? isExtensionInstalled()
                  ? redirectToSettingsPage
                  : openInstallExtensionModal
                : null
            }
            style={{ margin: "24px" }}
          >
            Configure webpages
          </Button>
        </AuthConfirmationPopover>
        <TutorialButton>
          See how it works <YoutubeFilled style={{ color: "red", fontSize: 18, marginTop: 4 }} />
        </TutorialButton>
      </div>
      <Divider />
      <Typography.Text type="secondary">
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
      </Typography.Text>

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

const SessionOnboardingView: React.FC<SessionOnboardProps> = () => {
  const inputRef = useRef<InputRef>();

  const [isInstallExtensionModalVisible, setIsInstallExtensionModalVisible] = useState(false);

  const openInstallExtensionModal = useCallback(() => {
    setIsInstallExtensionModalVisible(true);
    trackInstallExtensionDialogShown({ src: "sessions_home_page" });
  }, []);

  const closeModal = useCallback(() => {
    setIsInstallExtensionModalVisible(false);
  }, []);

  const handleStartRecordingBtnClicked = useCallback(() => {
    trackStartRecordingWithURLClicked();
    if (isExtensionInstalled()) {
      const urlToRecord = sanitize(inputRef?.current.input.value);
      if (isValidUrl(urlToRecord)) {
        trackStartRecordingOnExternalTarget(urlToRecord);
        return startRecordingOnUrl(urlToRecord);
      } else {
        trackTriedRecordingForInvalidURL(urlToRecord);
        toast.warn("Please enter a valid URL");
      }
    } else {
      openInstallExtensionModal();
    }

    function sanitize(url: string) {
      let sanitizedURL = url.trim();
      if (sanitizedURL && !sanitizedURL.startsWith("http://") && !sanitizedURL.startsWith("https://")) {
        sanitizedURL = "https://" + sanitizedURL;
        inputRef.current.input.value = sanitizedURL;
        return sanitizedURL;
      }
      return sanitizedURL;
    }
  }, [openInstallExtensionModal]);

  const handleSettingsNavigation = useCallback(() => {
    trackOnboardingToSettingsNavigate();
    navigateToSessionSettings();
  }, []);

  return (
    <div className="onboarding-content-container">
      <div className="onboarding-banner">
        <Row className="banner-header" justify="space-between">
          <Col>
            <Title className="banner-title">Record &amp; replay your first browsing sessions</Title>
          </Col>
          <Col className="settings-btn">
            <Button onClick={handleSettingsNavigation}>
              <SettingOutlined /> &nbsp; <Text>Settings</Text>
            </Button>
          </Col>
        </Row>
        <Row justify="space-between">
          <Col span={11} className="banner-text-container">
            <Row className="banner-description">
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
                <Input ref={inputRef} placeholder="Enter the URL you want to record" />
              </Col>
              <Col span={3} className="start-btn-container">
                <Button size="middle" type="primary" onClick={handleStartRecordingBtnClicked}>
                  {" "}
                  Start Recording
                </Button>
              </Col>
            </Row>
          </Col>
          <Col span={13} className="right-col">
            <Row justify="end">
              <img src={StartSessionRecordingGif} alt="How to start session recording" className="demo-video" />
            </Row>
            <Row onClick={trackOnboardingYTVideoClicked}>
              <a
                href="https://www.youtube.com/embed/g_qXQAzUQgU?start=74"
                target="__blank"
                className="yt-cta-container"
              >
                <Row justify="end" align="middle" className="yt-cta">
                  <YoutubeFilled style={{ color: "red", fontSize: 18, marginTop: 4, margin: 0 }} /> &nbsp;
                  <Text underline>Watch it in action</Text>
                </Row>
              </a>
            </Row>
          </Col>
        </Row>
      </div>
      <div className="onboarding-footer">
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
      </div>
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
const OnboardingView: React.FC<OnboardingProps> = ({ type, redirectToSettingsPage }) => {
  // todo: remove hard coded value once actual compatibility version has been set
  const shownNewOnboarding = isFeatureCompatible(FEATURES.RECORD_SESSION_ON_URL) || true;
  if (type === OnboardingTypes.NETWORK) {
    return <NewtorkSessionsOnboarding />;
  } else {
    return shownNewOnboarding ? (
      <SessionOnboardingView />
    ) : (
      <OldSessionOnboardingView redirectToSettingsPage={redirectToSettingsPage} />
    );
  }
};

export default OnboardingView;
