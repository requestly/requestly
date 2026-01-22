import React from "react";
import { Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { WorkspaceCreationView } from "./components/WorkspaceCreationView";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { CreateWorkspaceModalOld } from "../CreateWorkspaceModalOld/CreateWorkspaceModalOld";
import { globalActions } from "store/slices/global/slice";
import "./createWorkspaceModal.scss";
import { WorkspaceType } from "features/workspaces/types";

interface Props {
  isOpen: boolean;
  workspaceType?: WorkspaceType;
  toggleModal: () => void;
  callback?: () => void;
  source?: string;
}

export const CreateWorkspaceModal: React.FC<Props> = ({
  isOpen,
  toggleModal,
  callback,
  workspaceType = WorkspaceType.SHARED,
  source,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);

  if (!user.loggedIn && workspaceType === WorkspaceType.SHARED) {
    dispatch(
      globalActions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          eventSource: source,
        },
      })
    );
    toggleModal();
    return null;
  }

  if (!isFeatureCompatible(FEATURES.LOCAL_FIRST_DESKTOP_APP)) {
    return (
      <CreateWorkspaceModalOld
        isOpen={isOpen}
        toggleModal={toggleModal}
        callback={callback}
        defaultWorkspaceType={workspaceType}
      />
    );
  }

  return (
    <Modal
      width={480}
      open={isOpen}
      onCancel={toggleModal}
      className="custom-rq-modal create-workspace-modal"
      footer={null}
      closable={false}
    >
      <MdClose className="create-workspace-modal__close-icon" onClick={toggleModal} />
      <WorkspaceCreationView
        workspaceType={workspaceType}
        onCancel={toggleModal}
        callback={() => {
          toggleModal();
          callback?.();
        }}
        analyticEventSource="create_workspace_modal"
        isOpenedInModal
      />
    </Modal>
  );
};
