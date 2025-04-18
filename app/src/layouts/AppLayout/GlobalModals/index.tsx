import { getActiveModals } from "store/slices/global/modals/selectors";
import { AuthModal } from "features/onboarding/screens/auth/modals/AuthModal/AuthModal";
import RQAuthModal from "components/authentication/AuthModal";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { useFeatureIsOn } from "@growthbook/growthbook-react";

export const GlobalModals = () => {
  const dispatch = useDispatch();
  const activeModals = useSelector(getActiveModals);
  const isBrowserstackIntegrationEnabled = useFeatureIsOn("browserstack_integration");

  const toggleAuthModal = () => {
    dispatch(globalActions.toggleActiveModal({ modalName: "authModal" }));
  };

  return (
    <>
      {activeModals.authModal.isActive ? (
        <>
          {isBrowserstackIntegrationEnabled ? (
            <AuthModal
              isOpen={activeModals.authModal.isActive}
              authMode={activeModals.authModal.props.authMode}
              eventSource={activeModals.authModal.props.eventSource}
              closable={activeModals.authModal.props.closable}
            />
          ) : (
            <RQAuthModal
              isOpen={activeModals.authModal.isActive}
              toggle={() => toggleAuthModal()}
              {...activeModals.authModal.props}
            />
          )}
        </>
      ) : null}
    </>
  );
};
