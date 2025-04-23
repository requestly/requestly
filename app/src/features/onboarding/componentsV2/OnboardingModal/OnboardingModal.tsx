import { useEffect, useState } from "react";
import { Modal } from "antd";
import { AuthScreen } from "features/onboarding/screens/auth/AuthScreen";
import { AuthScreenContextProvider } from "features/onboarding/screens/auth/context";
import { AuthScreenMode } from "features/onboarding/screens/auth/types";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getAndUpdateInstallationDate } from "utils/Misc";
import { getAppMode, getHasSeenOnboardingModal } from "store/selectors";
import { globalActions } from "store/slices/global/slice";
import { useIsAuthSkipped } from "hooks";
import "./OnboardingModal.scss";

export const OnboardingModal = () => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const hasSeenOnboardingModal = useSelector(getHasSeenOnboardingModal);
  const isAuthSkipped = useIsAuthSkipped();

  useEffect(() => {
    if (user.loggedIn) {
      setIsModalVisible(false);
    }
  }, [user.loggedIn]);

  useEffect(() => {
    getAndUpdateInstallationDate(appMode, false, false)
      .then((install_date) => {
        if (install_date) {
          if (new Date(install_date) >= new Date("2025-02-07") && !hasSeenOnboardingModal && !user.loggedIn) {
            if (isAuthSkipped) {
              dispatch(globalActions.updateHasSeenOnboardingModal(true));
              return;
            }

            setIsModalVisible(true);
            dispatch(globalActions.updateHasSeenOnboardingModal(true));
          }
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, [appMode, dispatch, hasSeenOnboardingModal, isAuthSkipped, user.loggedIn]);

  if (!user.loggedIn) {
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
        >
          <AuthScreen />
        </AuthScreenContextProvider>
      </Modal>
    );
  }

  return null;
};
