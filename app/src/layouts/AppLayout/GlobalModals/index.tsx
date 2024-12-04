import { useDispatch, useSelector } from "react-redux";
import AuthModal from "components/authentication/AuthModal";
import { globalActions } from "store/slices/global/slice";
import { getActiveModals } from "store/slices/global/modals/selectors";

export const GlobalModals = () => {
  const dispatch = useDispatch();
  const activeModals = useSelector(getActiveModals);

  const toggleAuthModal = () => {
    dispatch(globalActions.toggleActiveModal({ modalName: "authModal" }));
  };

  return (
    <>
      {activeModals.authModal.isActive ? (
        <AuthModal
          isOpen={activeModals.authModal.isActive}
          toggle={() => toggleAuthModal()}
          {...activeModals.authModal.props}
        />
      ) : null}
    </>
  );
};
