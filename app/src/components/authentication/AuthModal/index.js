import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Modal } from "antd";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import APP_CONSTANTS from "../../../config/constants";
import { trackAuthModalShownEvent } from "modules/analytics/events/common/auth/authModal";
import "./AuthModal.css";
import { AuthScreen } from "features/onboarding";

const AuthModal = ({
  isOpen,
  toggle,
  authMode = APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
  eventSource,
  callback,
  warningMessage,
  closable = true,
}) => {
  const user = useSelector(getUserAuthDetails);

  useEffect(() => {
    if (user.loggedIn) {
      toggle();
    }
  }, [user.loggedIn, toggle]);

  useEffect(() => {
    if (isOpen) {
      trackAuthModalShownEvent(eventSource);
    }
  }, [isOpen, eventSource]);

  return (
    <>
      {closable && (
        <img
          src={"/assets/media/components/close.svg"}
          width={15}
          className="modal-close-icon"
          onClick={() => toggle()}
          alt="close-icon"
        />
      )}
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
        width={670}
        maskClosable={false}
      >
        <AuthScreen
          isOpen={false}
          defaultAuthMode={authMode}
          source={eventSource}
          callback={callback}
          toggleAuthModal={toggle}
          warningMessage={warningMessage}
        />
      </Modal>
    </>
  );
};

export default AuthModal;
