import React from "react";
import { Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { WorkspaceType } from "types";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { WorkspaceCreationView } from "./components/WorkspaceCreationView";
import "./createWorkspaceModal.scss";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { CreateWorkspaceModalOld } from "../CreateWorkspaceModalOld/CreateWorkspaceModalOld";
import { globalActions } from "store/slices/global/slice";

interface Props {
  isOpen: boolean;
  workspaceType?: WorkspaceType;
  toggleModal: () => void;
  callback?: () => void;
}

export const CreateWorkspaceModal: React.FC<Props> = ({
  isOpen,
  toggleModal,
  callback,
  workspaceType = WorkspaceType.SHARED,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);

  if (!user.loggedIn && workspaceType === WorkspaceType.SHARED) {
    dispatch(globalActions.toggleActiveModal({ modalName: "authModal", newValue: true }));
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
      width={workspaceType === WorkspaceType.SHARED ? 480 : 560}
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
      />
    </Modal>
  );
};
