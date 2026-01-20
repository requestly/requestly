import React, { useCallback, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { CheckOutlined, SettingOutlined } from "@ant-design/icons";
import { BsShieldCheck } from "@react-icons/all-files/bs/BsShieldCheck";
import { Button, Divider, Input, Row, Col, Typography, InputRef, Space } from "antd";
import { globalActions } from "store/slices/global/slice";
import { isExtensionInstalled, startRecordingOnUrl } from "actions/ExtensionActions";
import { isValidUrl } from "utils/FormattingHelper";
import { toast } from "utils/Toast";
import { prefixUrlWithHttps } from "utils/URLUtils";
import {
  trackInstallExtensionDialogShown,
  trackOnboardingToSettingsNavigate,
  trackOnboardingSampleSessionViewed,
  trackOnboardingPageViewed,
  trackStartRecordingOnExternalTarget,
  trackStartRecordingWithURLClicked,
  trackTriedRecordingForInvalidURL,
} from "modules/analytics/events/features/sessionRecording";
// import { ImportHarModalButton } from "../NetworkSessions/ImportHarModalButton";
import { getAppFlavour } from "utils/AppUtils";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
// import "./index.scss";
import { useNavigate } from "react-router-dom";
import { redirectToNetworkSession } from "utils/RedirectionUtils";
import HarImportModal from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/HarImportModal";

const { Text, Title } = Typography;

const CheckItem: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div>
      <CheckOutlined style={{ marginRight: "8px", fontSize: "16px", color: "#228B22" }} />
      <span>{label}</span>
    </div>
  );
};

export const GreenVerifiedCheck: React.FC<{}> = () => {
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
  isModalView?: boolean;
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
        {/* <ImportHarModalButton /> */}
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

export const SessionOnboardingView: React.FC<SessionOnboardProps> = ({
  redirectToSettingsPage,
  openDownloadedSessionModalBtn,
  isModalView = false,
}) => {
  const inputRef = useRef<InputRef>();
  const dispatch = useDispatch();
  const appFlavour = getAppFlavour();

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
    dispatch(globalActions.toggleActiveModal({ modalName: "extensionModal", newProps: modalProps }));
    trackInstallExtensionDialogShown({ src: "sessions_home_page" });
  }, [dispatch]);

  const handleStartRecordingBtnClicked = useCallback(() => {
    trackStartRecordingWithURLClicked(isModalView ? "modal" : "onboarding");
    if (isExtensionInstalled()) {
      const urlToRecord = prefixUrlWithHttps(inputRef?.current.input.value);
      inputRef.current.input.value = urlToRecord;
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
  }, [openInstallExtensionModal, isModalView]);

  const handleSettingsNavigation = useCallback(() => {
    trackOnboardingToSettingsNavigate();
    redirectToSettingsPage();
  }, [redirectToSettingsPage]);

  return (
    <div className="onboarding-content-container">
      {!isModalView && (
        <Row justify="end" align="middle" className="settings-row">
          <Space size={20}>
            {openDownloadedSessionModalBtn}
            <span onClick={handleSettingsNavigation} className="settings-btn">
              <SettingOutlined /> &nbsp; <Text underline>Settings</Text>
            </span>
          </Space>
        </Row>
      )}

      <Row justify="space-between" className="onboarding-banner">
        <Col span={isModalView ? 24 : 12} className="banner-text-container">
          <Row className="banner-header">
            <Title className="banner-title">
              Debug issues faster with{" "}
              {appFlavour === GLOBAL_CONSTANTS.APP_FLAVOURS.SESSIONBEAR ? "SessionBear" : "SessionBook"}
            </Title>
          </Row>
          <Row className="banner-description">
            <Text type="secondary" className="banner-text w-full">
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
            {!isModalView && (
              <Text type="secondary" className="banner-message banner-text">
                <GreenVerifiedCheck /> Sessions are not automatically saved to the cloud; they require manual saving
              </Text>
            )}
          </Row>
          <Col span={24}>
            <Row className="record-label">
              <Text type="secondary" className="banner-text">
                Record your {!isModalView && "first"} session
              </Text>
            </Row>
            <Row>
              <Col span={15} className="input-container">
                <Input
                  ref={inputRef}
                  placeholder="Enter Page URL eg. https://ebay.com"
                  onPressEnter={handleStartRecordingBtnClicked}
                />
              </Col>
              <Col span={3} className="start-btn-container">
                <Button size="middle" type="primary" onClick={handleStartRecordingBtnClicked}>
                  {" "}
                  Start Recording
                </Button>
              </Col>
            </Row>
          </Col>
        </Col>
        {!isModalView && (
          <Col span={12} className="banner-demo-video">
            <Row justify="end">
              <img
                src={
                  appFlavour === GLOBAL_CONSTANTS.APP_FLAVOURS.SESSIONBEAR
                    ? "/assets/media/common/SessionBear.gif"
                    : "/assets/media/common/sessions-banner.gif"
                }
                alt="How to start session recording"
                className="demo-video"
              />
            </Row>
            <Row onClick={trackOnboardingSampleSessionViewed}>
              <a
                href="https://app.requestly.io/sessions/saved/24wBYgAaKlgqCOflTTJj"
                target="__blank"
                className="sample-link-container"
              >
                <Row justify="end" align="middle" className="sample-link">
                  <Text underline>View sample session</Text>
                </Row>
              </a>
            </Row>
          </Col>
        )}
      </Row>
    </div>
  );
};

const OnboardingView: React.FC<OnboardingProps> = ({ type, redirectToSettingsPage, openDownloadedSessionModalBtn }) => {
  if (type === OnboardingTypes.NETWORK) {
    return <NewtorkSessionsOnboarding />;
  } else {
    return (
      <SessionOnboardingView
        redirectToSettingsPage={redirectToSettingsPage}
        openDownloadedSessionModalBtn={openDownloadedSessionModalBtn}
      />
    );
  }
};

export default OnboardingView;
