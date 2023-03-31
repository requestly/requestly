import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Button, Col, Row } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { RQModal } from "lib/design-system/components";
import LearnMoreAboutWorkspace from "../TeamViewer/common/LearnMoreAboutWorkspace";
import { getUniqueColorForWorkspace } from "utils/teams";
import { TeamInvite } from "types";
import { trackWorkspaceJoinClicked } from "modules/analytics/events/features/teams";
import "./JoinWorkspaceModal.css";

interface JoinWorkspaceModalProps {
  isOpen: boolean;
  teamInvites: TeamInvite[];
  handleModalClose: () => void;
  handleCreateNewWorkspaceClick: (e: React.MouseEvent) => void;
}

const JoinWorkspaceModal: React.FC<JoinWorkspaceModalProps> = ({
  isOpen,
  teamInvites,
  handleModalClose,
  handleCreateNewWorkspaceClick,
}) => {
  const navigate = useNavigate();

  const handleJoinClick = (teamId: string, inviteId: string) => {
    trackWorkspaceJoinClicked(teamId, "workspace_joining_modal");
    navigate(`/invite/${inviteId}`);
  };

  return (
    <RQModal
      centered
      open={isOpen}
      onCancel={handleModalClose}
      className="join-workspace-modal"
    >
      <div className="rq-modal-content">
        {teamInvites?.length > 0 && (
          <div className="join-workspace-modal-header header">
            You have access to these workspaces
          </div>
        )}

        {teamInvites?.length > 0 ? (
          <ul className="teams-invite-list">
            {teamInvites.map(({ id, metadata }) => (
              <li key={id}>
                <Row
                  wrap={false}
                  align="middle"
                  justify="space-between"
                  className="w-full team-invite-row"
                >
                  <Col>
                    <Avatar
                      size={28}
                      shape="square"
                      className="workspace-avatar"
                      icon={metadata.teamName?.[0]?.toUpperCase() ?? "W"}
                      style={{
                        backgroundColor: `${getUniqueColorForWorkspace(
                          metadata.teamId,
                          metadata.teamName
                        )}`,
                      }}
                    />
                    <div>{metadata.teamName}</div>
                  </Col>

                  <Button onClick={() => handleJoinClick(metadata.teamId, id)}>
                    Join
                  </Button>
                </Row>
              </li>
            ))}
          </ul>
        ) : (
          <div className="title teams-invite-empty-message">
            <img
              alt="smile"
              width="48px"
              height="44px"
              src="/assets/img/workspaces/smiles.svg"
            />
            <div>You don't have any workspace invites!</div>
          </div>
        )}
      </div>

      {/* footer */}
      <Row align="middle" justify="space-between" className="rq-modal-footer">
        <Col>
          <LearnMoreAboutWorkspace linkText="Learn more about team workspaces" />
        </Col>
        <Col>
          <Button
            className="display-row-center"
            onClick={handleCreateNewWorkspaceClick}
          >
            <PlusOutlined /> Create new workspace
          </Button>
        </Col>
      </Row>
    </RQModal>
  );
};

export default JoinWorkspaceModal;
