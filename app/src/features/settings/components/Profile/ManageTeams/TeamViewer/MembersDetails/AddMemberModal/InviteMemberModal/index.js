import React, { useState } from "react";
import { toast } from "utils/Toast.js";
import { Row, Col, Button } from "antd";
import { getFunctions, httpsCallable } from "firebase/functions";
import { RQModal } from "lib/design-system/components";
import "./InviteMemberModal.css";

const InviteMemberModal = ({ isOpen, teamId, emails, isAdmin, handleModalClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInviteUser = () => {
    setIsProcessing(true);
    const functions = getFunctions();
    const inviteEmailToTeam = httpsCallable(functions, "inviteEmailToTeam");
    inviteEmailToTeam({
      teamId: teamId,
      emails: emails,
      isAdmin: isAdmin,
    })
      .then((res) => {
        const response = res.data;
        if (response.success) {
          toast.info("We've sent them an invite");
        } else {
          toast.error("Opps! Couldn`t send the invite");
        }
      })
      .catch((err) => {
        toast.error("Opps! Couldn`t send the invite");
      })
      .finally(() => {
        handleModalClose();
        setIsProcessing(false);
      });
  };

  return (
    <RQModal centered open={isOpen} onCancel={handleModalClose}>
      <div className="rq-modal-content">
        <div>
          <img alt="oops" className="inivite-modal-oops-icon" src="/assets/media/settings/oops.svg" />
        </div>
        <div className="header invite-member-modal-header">Oops!</div>
        <p className="text-gray">{emails.join(", ")}</p>

        <div className="text-gray text-sm no-account-message">
          Does not seem to have a Requestly account yet. Do you want to send them a magic invite link via email? <br />
          They will be automatically added to this team upon signup using that link.
        </div>
      </div>

      <Row align="right" className="rq-modal-footer">
        <Col className="ml-auto">
          <Button data-dismiss="modal" onClick={handleModalClose} disabled={isProcessing}>
            No, I'll add them later
          </Button>
          <Button
            type="primary"
            loading={isProcessing}
            onClick={handleInviteUser}
            className="send-workspace-invite-btn"
          >
            Yes, please send invite
          </Button>
        </Col>
      </Row>
    </RQModal>
  );
};

export default InviteMemberModal;
