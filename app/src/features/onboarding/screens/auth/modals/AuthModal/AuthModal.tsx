import { Modal } from "antd";
import { AuthScreen } from "../../AuthScreen";
import "./authModal.scss";
import { useTheme } from "styled-components";

export const AuthModal = () => {
  const theme = useTheme();
  return (
    <Modal
      open={true}
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
