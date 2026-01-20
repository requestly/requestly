import { useEffect, useState } from "react";
import { Modal } from "antd";
import { AuthScreen } from "features/onboarding/screens/auth/AuthScreen";
import { AuthScreenContextProvider } from "features/onboarding/screens/auth/context";
import { AuthScreenMode } from "features/onboarding/screens/auth/types";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getAndUpdateInstallationDate } from "utils/Misc";
import { getAppMode } from "store/selectors";
import { globalActions } from "store/slices/global/slice";
import { useIsAuthSkipped } from "hooks";
import { shouldShowOnboarding } from "features/onboarding/utils";
import { trackAuthModalShownEvent } from "modules/analytics/events/common/auth/authModal";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { SOURCE } from "modules/analytics/events/common/constants";
import "./OnboardingModal.scss";

export const OnboardingModal = () => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const isAuthSkipped = useIsAuthSkipped();

  useEffect(() => {
    if (user.loggedIn) {
      setIsModalVisible(false);
      dispatch(globalActions.updateIsOnboardingCompleted(true));
    }
  }, [user.loggedIn, dispatch]);

  useEffect(() => {
    getAndUpdateInstallationDate(appMode, false, false)
      .then((install_date) => {
        if (install_date) {
          if (new Date(install_date) >= new Date("2025-02-07") && !user.loggedIn) {
            if (isAuthSkipped) {
              dispatch(globalActions.updateIsOnboardingCompleted(true));
              return;
            }
            setIsModalVisible(true);

            const eventType =
              appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? SOURCE.DESKTOP_ONBOARDING : SOURCE.EXTENSION_ONBOARDING;
            trackAuthModalShownEvent("onboarding", eventType);
          }
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, [appMode, dispatch, isAuthSkipped, user.loggedIn]);

  if (!user.loggedIn && shouldShowOnboarding()) {
    return (
      <Modal
        open={isModalVisible}
        maskStyle={{ background: "#1a1a1a" }}
        footer={null}
        wrapClassName="rq-onboarding-modal"
        closable={false}
      >
        <AuthScreenContextProvider
          screenMode={AuthScreenMode.MODAL}
          isOnboarding={true}
          toggleModal={() => setIsModalVisible(false)}
          initialEventSource="onboarding"
        >
          <AuthScreen />
        </AuthScreenContextProvider>
      </Modal>
    );
  }

  return null;
};
