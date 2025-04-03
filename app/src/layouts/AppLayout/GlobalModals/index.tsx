import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { getActiveModals } from "store/slices/global/modals/selectors";
import { AuthModal } from "features/onboarding/screens/auth/modals/AuthModal/AuthModal";

export const GlobalModals = () => {
  const dispatch = useDispatch();
  const activeModals = useSelector(getActiveModals);

  const toggleAuthModal = () => {
    dispatch(globalActions.toggleActiveModal({ modalName: "authModal" }));
  };

  return <>{activeModals.authModal.isActive ? <AuthModal /> : null}</>;
};
