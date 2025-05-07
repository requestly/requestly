import React, { useCallback, useEffect, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "antd";
import { AuthScreen } from "../../AuthScreen";
import { AuthScreenContextProvider } from "../../context";
import APP_CONSTANTS from "config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { DesktopAppAuthScreen } from "../../desktopAppAuth/DesktopAppAuthScreen";
import { AuthScreenMode } from "../../types";
import { globalActions } from "store/slices/global/slice";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { redirectToOAuthUrl } from "utils/RedirectionUtils";
import { trackAuthModalShownEvent } from "modules/analytics/events/common/auth/authModal";
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
  const navigate = useNavigate();
  const appMode = useSelector(getAppMode);
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);

  const toggleModal = useCallback(
    (value?: boolean) => {
      dispatch(globalActions.toggleActiveModal({ modalName: "authModal", newValue: value }));
    },
    [dispatch]
  );

  const isWebApp = appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP;
  const isWebAppSignup = isWebApp && authMode === APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP;

  useEffect(() => {
    if (user.loggedIn) {
      toggleModal(false);
    }
  }, [user.loggedIn, toggleModal]);

  useEffect(() => {
    if (!isWebAppSignup && isOpen) {
      trackAuthModalShownEvent(eventSource, "login");
    }
  }, [isOpen, isWebAppSignup, eventSource]);

  useLayoutEffect(() => {
    if (isWebAppSignup && isOpen) {
      redirectToOAuthUrl(navigate);
    }
  }, [isWebAppSignup, isOpen, eventSource, navigate]);

  if (isWebAppSignup) {
    return null;
  }

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
          toggleModal={toggleModal}
        >
          {appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? <DesktopAppAuthScreen /> : <AuthScreen />}
        </AuthScreenContextProvider>
      </>
    </Modal>
  );
};
