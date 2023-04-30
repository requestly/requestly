import { CheckOutlined, YoutubeFilled } from "@ant-design/icons";
import { Button, Divider, Typography, Modal } from "antd";
import React, { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import TutorialButton from "./TutorialButton";
import { isExtensionInstalled } from "actions/ExtensionActions";
import InstallExtensionCTA from "../../../../../components/misc/InstallExtensionCTA";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { getUserAuthDetails } from "store/selectors";
import { AUTH } from "modules/analytics/events/common/constants.js";
import { trackInstallExtensionDialogShown } from "modules/analytics/events/features/sessionRecording";
import ImportandSaveNetworkHarModalButton from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/HarImportModal";
import { redirectToNetworkSession } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
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
      console.log("navigating for sessionId: ", sessionId);
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
      <Typography.Title level={1}>Record &amp; Replay your browsing sessions</Typography.Title>
      <Typography.Text type="secondary">
        <div>Record your network sessions and Share with others for offline review or debugging.</div>
      </Typography.Text>
      <div>
        <ImportandSaveNetworkHarModalButton onSaved={stableNavigate} />
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
    </div>
  );
};

const SessionOnboardingView: React.FC<SessionOnboardProps> = ({ launchConfig }) => {
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
          callback={isExtensionInstalled() ? launchConfig : openInstallExtensionModal}
          source={AUTH.SOURCE.SESSION_RECORDING}
        >
          <Button
            type="primary"
            onClick={
              user?.details?.isLoggedIn ? (isExtensionInstalled() ? launchConfig : openInstallExtensionModal) : null
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
      <Modal
        open={isInstallExtensionModalVisible}
        width="60%"
        bodyStyle={{ padding: 12 }}
        maskClosable={false}
        footer={null}
        onCancel={closeModal}
      >
        <InstallExtensionCTA
          heading={""}
          subHeadingExtension={"Auto-record debugging sessions"}
          supportsMobileDevice={false}
          supportedBrowsers={["Chrome", "Edge"]}
          hasBorder={false}
          eventPage="session_recording_page"
        />
      </Modal>
    </div>
  );
};

const OnboardingView: React.FC<OnboardingProps> = ({ type, launchConfig }) => {
  if (type === OnboardingTypes.NETWORK) {
    return <NewtorkSessionsOnboarding />;
  } else {
    return launchConfig ? <SessionOnboardingView launchConfig={launchConfig} /> : null;
  }
};

export default OnboardingView;
