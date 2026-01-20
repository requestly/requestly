import React, { useMemo, useState } from "react";
import { isExtensionInstalled, startRecordingOnUrl } from "actions/ExtensionActions";
import { Col, InputRef, Row, Space, Typography, Input } from "antd";
import { trackInstallExtensionDialogShown } from "modules/analytics/events/features/apiClient";
import {
  trackOnboardingPageViewed,
  trackOnboardingSampleSessionViewed,
  trackOnboardingToSettingsNavigate,
  trackStartRecordingOnExternalTarget,
  trackStartRecordingWithURLClicked,
  trackTriedRecordingForInvalidURL,
} from "modules/analytics/events/features/sessionRecording";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { globalActions } from "store/slices/global/slice";
import { isValidUrl } from "utils/FormattingHelper";
import { redirectToSessionSettings } from "utils/RedirectionUtils";
import { toast } from "utils/Toast";
import { prefixUrlWithHttps } from "utils/URLUtils";
import { MdOutlineSettings } from "@react-icons/all-files/md/MdOutlineSettings";
import { BsShieldCheck } from "@react-icons/all-files/bs/BsShieldCheck";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import FEATURES from "config/constants/sub/features";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import { ImportWebSessionModalButton } from "../SessionsList/components/ImportWebSessionModalButton/ImportWebSessionModalButton";
import { RQButton } from "lib/design-system-v2/components";
import { ImportSessionModal } from "features/sessionBook/modals/ImportSessionModal/ImportSessionModal";
import { getAppFlavour } from "utils/AppUtils";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { useRBAC } from "features/rbac";
import { Conditional } from "components/common/Conditional";
import "./sessionsOnboardingView.scss";

const { Text, Title } = Typography;

interface SessionOnboardingViewProps {
  isModalView?: boolean;
}

export const SessionsOnboardingView: React.FC<SessionOnboardingViewProps> = ({ isModalView = false }) => {
  const inputRef = useRef<InputRef>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isImportSessionModalOpen, setIsImportSessionModalOpen] = useState(false);
  const appFlavour = getAppFlavour();
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("session_recording", "create");

  useEffect(() => {
    trackOnboardingPageViewed();
  }, []);

  const isDesktopSessionsCompatible =
    useFeatureIsOn("desktop-sessions") && isFeatureCompatible(FEATURES.DESKTOP_SESSIONS);

  const openDownloadedSessionModalBtn = useMemo(() => {
    return isDesktopSessionsCompatible ? (
      <ImportWebSessionModalButton />
    ) : (
      <RQButton type="secondary" onClick={() => setIsImportSessionModalOpen(true)}>
        Upload & view downloaded sessions
      </RQButton>
    );
  }, [isDesktopSessionsCompatible]);

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
    redirectToSessionSettings(navigate);
  }, [navigate]);

  return (
    <>
      <div className="onboarding-content-container">
        {!isModalView && (
          <Conditional condition={isValidPermission}>
            <Row justify="end" align="middle" className="settings-row">
              <Space size={20}>
                {openDownloadedSessionModalBtn}
                {appFlavour === GLOBAL_CONSTANTS.APP_FLAVOURS.REQUESTLY && (
                  <span onClick={handleSettingsNavigation} className="settings-btn">
                    <MdOutlineSettings /> &nbsp; <Text underline>Settings</Text>
                  </span>
                )}
              </Space>
            </Row>
          </Conditional>
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
                  <BsShieldCheck style={{ fill: "url(#green-gradient)" }} className="check-icon" />
                  {/* GREEN GRADIENT on svg */}
                  <svg width="0" height="0">
                    <linearGradient id="green-gradient" x1="100%" y1="100%" x2="0%" y2="0%">
                      <stop stopColor="#eefccb" offset="0%" />
                      <stop stopColor="#aefc31" offset="50%" />
                      <stop stopColor="#0dbb48" offset="100%" />
                    </linearGradient>
                  </svg>{" "}
                  Sessions are not automatically saved to the cloud; they require manual saving
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
                    disabled={!isValidPermission}
                    placeholder="Enter Page URL eg. https://ebay.com"
                    onPressEnter={handleStartRecordingBtnClicked}
                  />
                </Col>
                <Col span={3} className="start-btn-container">
                  <RQButton
                    size="default"
                    type="primary"
                    disabled={!isValidPermission}
                    onClick={handleStartRecordingBtnClicked}
                  >
                    Start Recording
                  </RQButton>
                </Col>
              </Row>
            </Col>
          </Col>
          {!isModalView && (
            <Col span={12} className="banner-demo-video">
              <Row justify="end">
                <img
                  src={"/assets/media/common/sessions-banner.gif"}
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
      <ImportSessionModal isOpen={isImportSessionModalOpen} toggleModal={() => setIsImportSessionModalOpen(false)} />
    </>
  );
};
