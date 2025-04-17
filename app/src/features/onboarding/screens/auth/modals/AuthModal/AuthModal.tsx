import React from "react";
import { Modal } from "antd";
import { AuthScreen } from "../../AuthScreen";
import { AuthScreenContextProvider } from "../../context";
import APP_CONSTANTS from "config/constants";
import "./authModal.scss";
import { AuthScreenMode } from "../../types";

interface AuthModalProps {
  isOpen: boolean;
  authMode?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, authMode = APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN }) => {
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
      <AuthScreenContextProvider initialAuthMode={authMode} screenMode={AuthScreenMode.MODAL}>
        <AuthScreen />
      </AuthScreenContextProvider>
    </Modal>
  );
};
