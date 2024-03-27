import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Modal } from "antd";
import { getUserAuthDetails } from "../../../store/selectors";
import { AuthScreen } from "features/onboarding";
import "./AuthModal.css";
import closeIcon from "../../../assets/images/modal/close.svg";
import APP_CONSTANTS from "../../../config/constants";

const AuthModal = ({
  isOpen,
  toggle,
  authMode = APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
  userActionMessage,
  eventSource,
  callback,
  closable = true,
}) => {
  const user = useSelector(getUserAuthDetails);

  useEffect(() => {
    if (user.loggedIn) {
      toggle();
    }
  }, [user.loggedIn, toggle]);

  return (
    <>
      <img src={closeIcon} width={15} className="modal-close-icon" onClick={() => toggle()} alt="close-icon" />
      <Modal
        size="small"
        visible={window.location.href.includes("/signin") || window.location.href.includes("/signup") ? false : isOpen}
        onCancel={closable ? () => toggle() : null}
        footer={null}
        centered={true}
        closeIcon={null}
        maskStyle={{ background: "#0d0d10f9" }}
        bodyStyle={{ padding: "0" }}
        wrapClassName="auth-modal-wrapper"
        closable={false}
        width={920}
      >
        <AuthScreen
          isOpen={false}
          defaultAuthMode={authMode}
          userActionMessage={userActionMessage ? userActionMessage : null}
          source={eventSource}
          callbacks={{
            onSignInSuccess: callback,
            onRequestPasswordResetSuccess: toggle,
          }}
        />
      </Modal>
    </>
  );
};

export default AuthModal;
