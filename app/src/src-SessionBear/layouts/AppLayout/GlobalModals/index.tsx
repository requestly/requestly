import { useDispatch, useSelector } from "react-redux";
import { getActiveModals } from "store/slices/global/modals/selectors";
import AuthModal from "components/authentication/AuthModal";
import { globalActions } from "store/slices/global/slice";

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
