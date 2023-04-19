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
const CheckItem: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div>
      <CheckOutlined style={{ marginRight: "8px", fontSize: "16px", color: "#228B22" }} />
      <span>{label}</span>
    </div>
  );
};

interface Props {
  launchConfig: () => void;
}

const OnboardingView: React.FC<Props> = ({ launchConfig }) => {
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
        visible={isInstallExtensionModalVisible}
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

export default OnboardingView;
