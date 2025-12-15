import React, { useState } from "react";
import { Button, Col, Input, Row } from "antd";
import { RQModal } from "lib/design-system/components";

interface DeleteWorkspaceModalProps {
  name: string;
  isOpen: boolean;
  deleteInProgress: boolean;
  handleModalClose: () => void;
  handleDeleteTeam: () => Promise<any>;
}

const DeleteWorkspaceModal: React.FC<DeleteWorkspaceModalProps> = ({
  name,
  isOpen,
  deleteInProgress,
  handleModalClose,
  handleDeleteTeam,
}) => {
  const [teamName, setTeamName] = useState<string>("");

  return (
    <RQModal centered open={isOpen} onCancel={handleModalClose}>
      <div className="rq-modal-content">
        <div>
          <img alt="smile" width="37px" height="37px" src="/assets/media/settings/oops.svg" />
        </div>
        <div className="header delete-team-modal-header">Are you sure you want to delete this workspace?</div>
        <p className="text-gray">
          This will <span className="text-white delete-team-permanently-highlight">permanently</span> delete the
          workspace <span className="text-white delete-team-workspace-name">{name}</span> and all the associated data,
          such as rules, session recordings and etc for all users.
        </p>

        <label className="text-sm delete-team-input-label">
          Please type <span className="text-bold">{name}</span> to confirm
        </label>
        <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} className="delete-team-input" />
      </div>

      <Row align="middle" wrap={false} justify="space-between" className="rq-modal-footer">
        <Col className="ml-auto">
          <Button onClick={handleModalClose} className="delete-team-cancel-btn">
            Cancel
          </Button>
          <Button
            danger
            className="delete-team-btn"
            disabled={name !== teamName}
            loading={deleteInProgress}
            onClick={handleDeleteTeam}
          >
            Delete workspace
          </Button>
        </Col>
      </Row>
    </RQModal>
  );
};

export default DeleteWorkspaceModal;
