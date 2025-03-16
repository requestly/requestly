import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import { Button, Modal } from "antd";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { DeleteOutlined } from "@ant-design/icons";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { isActiveWorkspaceShared } from "store/slices/workspaces/selectors";

const DeleteConfirmationModal = ({
  isOpen,
  toggle,
  ruleIdsToDelete,
  handleRecordsDeletion,
  handleDeleteRulesPermanently,
  isMoveToTrashInProgress,
  isDeletionInProgress,
}) => {
  const user = useSelector(getUserAuthDetails);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);

  const enableTrash = useFeatureIsOn("enable-trash");

  const tryMoveToTrash = useCallback(() => {
    handleRecordsDeletion(user?.details?.profile?.uid);
  }, [user, handleRecordsDeletion]);

  const handleDeleteClick = useCallback(() => {
    tryMoveToTrash();
    if (isOpen) toggle();
  }, [tryMoveToTrash, toggle, isOpen]);

  const renderMultipleRuleDeleteModal = () => {
    return (
      <Modal
        className="modal-dialog-centered modal-danger"
        open={isOpen}
        onCancel={!isMoveToTrashInProgress && !isDeletionInProgress && toggle}
        footer={null}
        title="Confirm Deletion"
        width={"40%"}
      >
        <div className="modal-body">
          <div className="py-3 text-center">
            <h3 className="heading">
              {enableTrash && user.loggedIn && !isSharedWorkspaceMode ? (
                <>Are you sure you want to delete the selected rules/groups?</>
              ) : (
                <>Are you sure you want to delete the selected rules/groups permanently?</>
              )}
            </h3>
          </div>
        </div>
        <div className="modal-footer" style={{ textAlign: "right" }}>
          <Button
            style={{ marginRight: "1rem" }}
            onClick={toggle}
            className="btn-white ml-auto"
            color="link"
            type="button"
            loading={isDeletionInProgress}
            disabled={isDeletionInProgress || isMoveToTrashInProgress}
          >
            No
          </Button>
          <Button
            danger
            type="primary"
            data-dismiss="modal"
            icon={<DeleteOutlined />}
            onClick={handleDeleteClick}
            loading={isMoveToTrashInProgress}
            disabled={isDeletionInProgress || isMoveToTrashInProgress}
          >
            Yes
          </Button>
        </div>
      </Modal>
    );
  };

  return renderMultipleRuleDeleteModal();
};

export default DeleteConfirmationModal;
