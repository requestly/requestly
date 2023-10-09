import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import { Button, Modal } from "antd";
import { getUserAuthDetails } from "store/selectors";
import { DeleteOutlined } from "@ant-design/icons";
import { getIsWorkspaceMode } from "store/features/teams/selectors";

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
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  const tryMoveToTrash = useCallback(() => {
    if (!user.loggedIn) {
      handleDeleteRulesPermanently();
    }
    if (isWorkspaceMode) {
      handleDeleteRulesPermanently();
    } else {
      handleRecordsDeletion(user?.details?.profile?.uid);
    }
  }, [user, isWorkspaceMode, handleDeleteRulesPermanently, handleRecordsDeletion]);

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
              {user.loggedIn && !isWorkspaceMode ? (
                <>
                  Are you sure you want to move selected {ruleIdsToDelete.length}{" "}
                  {ruleIdsToDelete.length === 1 ? "rule" : "rules"} into trash?
                </>
              ) : (
                <>
                  Are you sure you want to delete selected {ruleIdsToDelete.length}{" "}
                  {ruleIdsToDelete.length === 1 ? "rule" : "rules"} permanently?
                </>
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
