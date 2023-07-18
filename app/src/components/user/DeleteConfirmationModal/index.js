import React from "react";
import { useSelector } from "react-redux";
import { Button, Modal } from "antd";
import { getUserAuthDetails } from "store/selectors";
import { DeleteOutlined } from "@ant-design/icons";
import { getIsWorkspaceMode } from "store/features/teams/selectors";

const DeleteConfirmationModal = ({
  isOpen,
  toggle,
  ruleToDelete,
  rulesToDelete,
  promptToLogin,
  deleteRecordFromStorage,
  handleRecordsDeletion,
  handleDeleteRulesPermanently,
  isMoveToTrashInProgress,
  isDeletionInProgress,
}) => {
  const user = useSelector(getUserAuthDetails);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  const tryMoveToTrash = () => {
    if (!user.loggedIn) {
      handleDeleteRulesPermanently();
      return;
    }
    if (isWorkspaceMode) {
      handleDeleteRulesPermanently();
    } else {
      handleRecordsDeletion(user?.details?.profile?.uid);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleDeleteRecordFromStorage = () => {
    deleteRecordFromStorage(false, ruleToDelete);
  };

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
                  Are you sure you want to move selected {rulesToDelete.length}{" "}
                  {rulesToDelete.length === 1 ? "rule" : "rules"} into trash?
                </>
              ) : (
                <>
                  Are you sure you want to delete selected {rulesToDelete.length}{" "}
                  {rulesToDelete.length === 1 ? "rule" : "rules"} permanently?
                  <br />
                  {!isWorkspaceMode ? (
                    <>
                      <Button type="link" size="large" className="signin-link" onClick={promptToLogin}>
                        Sign in
                      </Button>
                      to move rules to trash. You can recover rules from trash later on.
                    </>
                  ) : null}
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
            onClick={tryMoveToTrash}
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
