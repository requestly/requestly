import { CheckOutlined, SettingOutlined, YoutubeFilled } from "@ant-design/icons";
import { BsShieldCheck } from "@react-icons/all-files/bs/BsShieldCheck";
import { Button, Divider, Input, Row, Col, Typography, InputRef, Space } from "antd";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { actions } from "store";
import HarImportModal from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/HarImportModal";
import { redirectToNetworkSession } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import InstallExtensionModal from "components/misc/InstallExtensionCTA/Modal";
import "./index.scss";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import {
  trackInstallExtensionDialogShown,
  trackOnboardingToSettingsNavigate,
  trackOnboardingSampleSessionViewed,
  trackOnboardingPageViewed,
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
import StartSessionRecordingGif from "assets/img/screenshots/sessions-banner.gif";

const { Text, Title } = Typography;

const CheckItem: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div>
      <CheckOutlined style={{ marginRight: "8px", fontSize: "16px", color: "#228B22" }} />
      <span>{label}</span>
    </div>
  );
};

const GreenVerifiedCheck: React.FC<{}> = () => {
  return (
    <>
      <BsShieldCheck style={{ fill: "url(#green-gradient)" }} className="check-icon" />
      {/* GREEN GRADIENT on svg */}
      <svg width="0" height="0">
        <linearGradient id="green-gradient" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop stopColor="#eefccb" offset="0%" />
          <stop stopColor="#aefc31" offset="50%" />
          <stop stopColor="#0dbb48" offset="100%" />
        </linearGradient>
      </svg>
    </>
  );
};

interface SessionOnboardProps {
  redirectToSettingsPage?: () => void;
  openDownloadedSessionModalBtn?: React.ReactNode;
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

const OldSessionOnboardingView: React.FC<SessionOnboardProps> = ({
  redirectToSettingsPage,
  openDownloadedSessionModalBtn,
}) => {
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
        <Space>
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
              style={{ margin: "24px 0" }}
            >
              Configure webpages
            </Button>
          </AuthConfirmationPopover>
          {openDownloadedSessionModalBtn}
          <TutorialButton className="session-tutorial-btn">
            See how it works <YoutubeFilled style={{ color: "red", fontSize: 18, marginTop: 4 }} />
          </TutorialButton>
        </Space>
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

const SessionOnboardingView: React.FC<SessionOnboardProps> = ({
  redirectToSettingsPage,
  openDownloadedSessionModalBtn,
}) => {
  const inputRef = useRef<InputRef>();
  const dispatch = useDispatch();

  useEffect(() => {
    trackOnboardingPageViewed();
  }, []);

  const openInstallExtensionModal = useCallback(() => {
    const modalProps = {
      heading: "Install Browser extension to record sessions for faster debugging and bug reporting",
      subHeading:
        "Safely capture mouse movement, console, network & environment data automatically on your device for sharing and debugging. Private and secure, works locally on your browser.",
      eventPage: "session_recording_page",
    };
    dispatch(actions.toggleActiveModal({ modalName: "extensionModal", newProps: modalProps }));
    trackInstallExtensionDialogShown({ src: "sessions_home_page" });
  }, [dispatch]);

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
    redirectToSettingsPage();
  }, [redirectToSettingsPage]);

  return (
    <div className="onboarding-content-container">
      <Row justify="end" align="middle" className="settings-row">
        <Space size={20}>
          {openDownloadedSessionModalBtn}
          <span onClick={handleSettingsNavigation} className="settings-btn">
            <SettingOutlined /> &nbsp; <Text underline>Settings</Text>
          </span>
        </Space>
      </Row>
      <Row justify="space-between" className="onboarding-banner">
        <Col span={12} className="banner-text-container">
          <Row className="banner-header">
            <Title className="banner-title">Debug issues faster with Session Replay</Title>
          </Row>
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

            <Text type="secondary" className="banner-message banner-text">
              <GreenVerifiedCheck /> Session Replays are not automatically saved to the cloud; they require manual
              saving
            </Text>
          </Row>
          <Row className="record-label">
            <Text type="secondary" className="banner-text">
              Record your first session
            </Text>
          </Row>
          <Row>
            <Col span={15} className="input-container">
              <Input ref={inputRef} placeholder="Enter Page URL eg. https://ebay.com" />
            </Col>
            <Col span={3} className="start-btn-container">
              <Button size="middle" type="primary" onClick={handleStartRecordingBtnClicked}>
                {" "}
                Start Recording
              </Button>
            </Col>
          </Row>
        </Col>
        <Col span={12} className="banner-demo-video">
          <Row justify="end">
            <img src={StartSessionRecordingGif} alt="How to start session recording" className="demo-video" />
          </Row>
          <Row onClick={trackOnboardingSampleSessionViewed}>
            <a
              href="https://app.requestly.io/sessions/saved/24wBYgAaKlgqCOflTTJj"
              target="__blank"
              className="sample-link-container"
            >
              <Row justify="end" align="middle" className="sample-link">
                <Text underline>View sample replay</Text>
              </Row>
            </a>
          </Row>
        </Col>
      </Row>
    </div>
  );
};
const OnboardingView: React.FC<OnboardingProps> = ({ type, redirectToSettingsPage, openDownloadedSessionModalBtn }) => {
  const shownNewOnboarding = isFeatureCompatible(FEATURES.SESSION_ONBOARDING);

  if (type === OnboardingTypes.NETWORK) {
    return <NewtorkSessionsOnboarding />;
  } else {
    return shownNewOnboarding ? (
      <SessionOnboardingView
        redirectToSettingsPage={redirectToSettingsPage}
        openDownloadedSessionModalBtn={openDownloadedSessionModalBtn}
      />
    ) : (
      <OldSessionOnboardingView
        redirectToSettingsPage={redirectToSettingsPage}
        openDownloadedSessionModalBtn={openDownloadedSessionModalBtn}
      />
    );
  }
};

export default OnboardingView;
