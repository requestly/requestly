import { useDispatch, useSelector } from "react-redux";
import { getActiveModals } from "store/selectors";
import AuthModal from "components/authentication/AuthModal";
import { actions } from "store";

export const GlobalModals = () => {
  const dispatch = useDispatch();
  const activeModals = useSelector(getActiveModals);

  const toggleAuthModal = () => {
    // @ts-ignore
    dispatch(actions.toggleActiveModal({ modalName: "authModal" }));
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
