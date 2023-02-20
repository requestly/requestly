import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Modal } from "antd";
//SUB COMPONENTS
import AuthForm from "../AuthForm";
//UTILS
import { getUserAuthDetails } from "../../../store/selectors";
// CONSTANTS
import APP_CONSTANTS from "../../../config/constants";
//STYLES
import "./AuthModal.css";
import closeIcon from "../../../assets/images/modal/close.svg";

const AuthModal = ({
  isOpen,
  toggle,
  authMode: authModeFromProps,
  src,
  userActionMessage,
  eventSource,
  callback,
  closable = true,
}) => {
  //GLOBAL STATE
  const user = useSelector(getUserAuthDetails);
  // Component State
  const [authMode, setAuthMode] = useState(
    authModeFromProps
      ? authModeFromProps
      : APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP
  );
  const [popoverVisible, setPopoverVisible] = useState(
    authMode === APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP ? true : true
  );
  useEffect(() => {
    if (user.loggedIn) {
      toggle();
    }
  }, [user.loggedIn, toggle, authMode]);

  return (
    <>
      <img
        src={closeIcon}
        width={15}
        className="modal-close-icon"
        onClick={() => toggle()}
        alt="close-icon"
      />
      <Modal
        size="small"
        visible={
          window.location.href.includes("/signin") ||
          window.location.href.includes("/signup")
            ? false
            : isOpen
        }
        onCancel={closable ? () => toggle() : null}
        footer={null}
        centered={true}
        closeIcon={null}
        maskStyle={{ background: "#0d0d10f9" }}
        bodyStyle={{ padding: "0" }}
        wrapClassName="modal-wrapper"
        closable={false}
        width={
          authMode === APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN ||
          authMode ===
            APP_CONSTANTS.AUTH.ACTION_LABELS.REQUEST_RESET_PASSWORD ||
          authMode === APP_CONSTANTS.AUTH.ACTION_LABELS.DO_RESET_PASSWORD
            ? "500px"
            : "auto"
        }
      >
        <AuthForm
          authMode={authMode}
          src={src}
          callbacks={{
            onSignInSuccess: callback,
            onRequestPasswordResetSuccess: toggle,
          }}
          setAuthMode={setAuthMode}
          popoverVisible={popoverVisible}
          setPopoverVisible={setPopoverVisible}
          userActionMessage={userActionMessage ? userActionMessage : null}
          eventSource={eventSource}
        />
      </Modal>
    </>
  );
};

export default AuthModal;
