import React from "react";
import { Modal } from "antd";
import { AuthScreen } from "../../AuthScreen";
import "./authModal.scss";

interface AuthModalProps {
  isOpen: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen }) => {
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
      <AuthScreen />
    </Modal>
  );
};
