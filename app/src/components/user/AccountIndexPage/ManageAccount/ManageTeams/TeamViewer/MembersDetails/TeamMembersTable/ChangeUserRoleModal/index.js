import React, { useState } from "react";
import { FaSpinner } from "@react-icons/all-files/fa/FaSpinner";
import { toast } from "utils/Toast.js";
import { Modal, Button } from "antd";
// Firebase
import { getFunctions, httpsCallable } from "firebase/functions";
const ChangeUserRoleModal = ({ isOpen, toggleModal, userId, teamId, isCurrentlyAdmin, callbackOnSuccess }) => {
  // Component State
  const [showLoader, setShowLoader] = useState(false);

  const changeTeamUserRole = () => {
    setShowLoader(true);
    const functions = getFunctions();
    const updateTeamUserRole = httpsCallable(functions, "teams-updateTeamUserRole");

    updateTeamUserRole({
      teamId: teamId,
      userId: userId,
      role: isCurrentlyAdmin ? "user" : "admin",
    })
      .then((res) => {
        toast.info("Successfully changed the role");
        callbackOnSuccess && callbackOnSuccess();
        setShowLoader(false);
        toggleModal();
      })
      .catch((err) => {
        toast.error(err.message);
        setShowLoader(false);
        toggleModal();
      });
  };

  return (
    <Modal style={{ marginTop: "200px" }} visible={isOpen} onCancel={toggleModal} footer={null}>
      <div>
        <h2>Change Role</h2>
      </div>
      <div>
        {isCurrentlyAdmin ? (
          <h3>
            Remove admin access from this user? <br />
            This user would no longer be able to add or remove members from this team
          </h3>
        ) : (
          <h3>
            Grant admin access to this user? <br />
            This user would be able to add or remove members from this team
          </h3>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row-reverse",
          marginTop: "20px",
        }}
      >
        <Button type="primary" onClick={() => changeTeamUserRole()} disabled={showLoader}>
          {showLoader ? (
            <span>
              <FaSpinner style={{ marginRight: "5px" }} className="icon-spin" />
              <span>{isCurrentlyAdmin ? "Revoking admin access" : "Granting admin access"}</span>
            </span>
          ) : isCurrentlyAdmin ? (
            "Remove admin access"
          ) : (
            "Grant admin access"
          )}
        </Button>
        <Button style={{ marginRight: "10px" }} type="secondary" onClick={toggleModal} disabled={showLoader}>
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default ChangeUserRoleModal;
