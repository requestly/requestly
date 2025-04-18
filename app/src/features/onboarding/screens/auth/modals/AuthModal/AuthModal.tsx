import React from "react";
import { Modal } from "antd";
import { AuthScreen } from "../../AuthScreen";
import { AuthScreenContextProvider } from "../../context";
import APP_CONSTANTS from "config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { DesktopAppAuthScreen } from "../../desktopAppAuth/DesktopAppAuthScreen";
import { AuthScreenMode } from "../../types";
import "./authModal.scss";

interface AuthModalProps {
  isOpen: boolean;
  closable?: boolean;
  authMode?: string;
  eventSource: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  closable = true,
  eventSource = "",
  authMode = APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
}) => {
  const appMode = useSelector(getAppMode);

  return (
    <Modal
      open={isOpen}
      width={670}
      closable={false}
      footer={null}
      className="rq-auth-modal"
      wrapClassName="rq-auth-modal-wrapper"
      maskStyle={{ background: "#1a1a1a" }}
    >
      <>
        <AuthScreenContextProvider
          isClosable={closable}
          initialEventSource={eventSource}
          initialAuthMode={authMode}
          screenMode={AuthScreenMode.MODAL}
        >
          {appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? <DesktopAppAuthScreen /> : <AuthScreen />}
        </AuthScreenContextProvider>
      </>
    </Modal>
  );
};
