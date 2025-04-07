import { getActiveModals } from "store/slices/global/modals/selectors";
import { AuthModal } from "features/onboarding/screens/auth/modals/AuthModal/AuthModal";
import { useSelector } from "react-redux";

export const GlobalModals = () => {
  const activeModals = useSelector(getActiveModals);

  return <>{activeModals.authModal.isActive ? <AuthModal isOpen={activeModals.authModal.isActive} /> : null}</>;
};
