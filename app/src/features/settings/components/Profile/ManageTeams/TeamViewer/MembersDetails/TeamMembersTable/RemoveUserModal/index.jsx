import React, { useState } from "react";
import { Button, Col, Row } from "antd";
import { toast } from "utils/Toast.js";
import { getFunctions, httpsCallable } from "firebase/functions";
import { RQModal } from "lib/design-system/components";
import "./RemoveUserModal.css";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";

const RemoveUserModal = ({ isOpen, toggleModal, userId, teamId, callbackOnSuccess }) => {
  const [showLoader, setShowLoader] = useState(false);
  const user = useSelector(getUserAuthDetails);

  const isUserRemovingHimself = user?.details?.profile?.uid === userId;

  const removeUserFromTeam = () => {
    setShowLoader(true);
    const functions = getFunctions();
    const updateTeamUserRole = httpsCallable(functions, "teams-updateTeamUserRole");

    if (isUserRemovingHimself) window.hasUserRemovedHimselfRecently = true;

    updateTeamUserRole({
      teamId: teamId,
      userId: userId,
      role: "remove",
    })
      .then((res) => {
        if (isUserRemovingHimself) {
          window.hasUserRemovedHimselfRecently = true;
        } else {
          toast.info("User removed");
        }

        callbackOnSuccess?.();
      })
      .catch((err) => {
        window.hasUserRemovedHimselfRecently = false;
        toast.error(err.message);
      })
      .finally(() => {
        setShowLoader(false);
        toggleModal();
      });
  };

  return (
    <RQModal centered open={isOpen} onCancel={toggleModal}>
      <div className="rq-modal-content">
        <div className="header">{isUserRemovingHimself ? "Leave workspace" : "Remove user"}</div>
        <div className="text-gray text-sm remove-user-message">
          {isUserRemovingHimself ? (
            <>
              <p>Do you really want to leave this workspace?</p>
              <p>You would no longer be able to access shared workspace items.</p>
            </>
          ) : (
            <>
              <p>Do you really want to remove this user from the team?</p>
              <p>They would no longer be able to access shared workspace items.</p>
            </>
          )}
        </div>
      </div>

      <Row align="middle" justify="end" className="rq-modal-footer">
        <Col>
          <Button type="secondary" onClick={toggleModal} disabled={showLoader}>
            Cancel
          </Button>
          <Button
            danger
            type="primary"
            loading={showLoader}
            disabled={showLoader}
            onClick={removeUserFromTeam}
            className="remove-user-btn"
          >
            {isUserRemovingHimself ? (showLoader ? "Leaving..." : "Leave") : showLoader ? "Removing user..." : "Remove"}
          </Button>
        </Col>
      </Row>
    </RQModal>
  );
};

export default RemoveUserModal;
