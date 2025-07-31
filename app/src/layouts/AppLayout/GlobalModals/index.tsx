import { getActiveModals } from "store/slices/global/modals/selectors";
import WorkspaceLoadingModal from "features/workspaces/modals/WorkspaceLoadingModal";
import SwitchWorkspaceModal from "features/workspaces/modals/SwitchWorkspaceModal/SwitchWorkspaceModal";
import { AuthModal } from "features/onboarding/screens/auth/modals/AuthModal/AuthModal";
import RQAuthModal from "components/authentication/AuthModal";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { useIsBrowserStackIntegrationOn } from "hooks/useIsBrowserStackIntegrationOn";

export const GlobalModals = () => {
  const dispatch = useDispatch();
  const activeModals = useSelector(getActiveModals);
  const isBrowserstackIntegrationOn = useIsBrowserStackIntegrationOn();

  const toggleAuthModal = () => {
    dispatch(globalActions.toggleActiveModal({ modalName: "authModal" }));
  };

  return (
    <>
      {activeModals.authModal.isActive ? (
        <>
          {isBrowserstackIntegrationOn ? (
            <AuthModal
              isOpen={activeModals.authModal.isActive}
              authMode={activeModals.authModal.props.authMode}
              eventSource={activeModals.authModal.props.eventSource}
              closable={activeModals.authModal.props.closable}
              redirectURL={activeModals.authModal.props.redirectURL}
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
      {activeModals.workspaceLoadingModal.isActive ? (
        <WorkspaceLoadingModal
          isOpen={activeModals.workspaceLoadingModal.isActive}
          close={() =>
            dispatch(globalActions.toggleActiveModal({ modalName: "workspaceLoadingModal", newValue: false }))
          }
          {...activeModals.workspaceLoadingModal.props}
        />
      ) : null}
      {activeModals.switchWorkspaceModal.isActive ? (
        <SwitchWorkspaceModal
          isOpen={activeModals.switchWorkspaceModal.isActive}
          toggleModal={() => dispatch(globalActions.toggleActiveModal({ modalName: "switchWorkspaceModal" }))}
          {...activeModals.switchWorkspaceModal.props}
        />
      ) : null}
    </>
  );
};
