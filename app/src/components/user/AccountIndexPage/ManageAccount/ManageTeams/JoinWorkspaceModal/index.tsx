import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { getAppMode } from "store/selectors";
import { Avatar, Button, Col, Row } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { RQModal } from "lib/design-system/components";
import LearnMoreAboutWorkspace from "../TeamViewer/common/LearnMoreAboutWorkspace";
import { getUniqueColorForWorkspace } from "utils/teams";
import { getFunctions, httpsCallable } from "firebase/functions";
import { TeamInviteMetadata } from "types";
import { trackWorkspaceJoinClicked } from "modules/analytics/events/features/teams";
import { toast } from "utils/Toast";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { actions } from "store";
import "./JoinWorkspaceModal.css";

interface JoinWorkspaceModalProps {
  isOpen: boolean;
  teamInvites: TeamInviteMetadata[];
  allowCreateNewWorkspace?: boolean;
  handleModalClose: () => void;
  handleCreateNewWorkspaceClick?: (e: React.MouseEvent) => void;
}

interface InviteRowProps {
  index: number;
  team: TeamInviteMetadata;
  handleModalClose: () => void;
}

const InviteRow: React.FC<InviteRowProps> = ({ index, team, handleModalClose }) => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const [isJoining, setIsJoining] = useState<boolean>(false);

  const handleJoinClick = (team: TeamInviteMetadata) => {
    trackWorkspaceJoinClicked(team?.teamId, "workspace_joining_modal");
    setIsJoining(true);
    const functions = getFunctions();
    const acceptInvite = httpsCallable(functions, "invites-acceptInvite");

    acceptInvite({ inviteId: team?.inviteId })
      .then((res: any) => {
        if (res?.data?.success) {
          toast.success("Successfully joined workspace");
          if (res?.data?.data?.invite.type === "teams") {
            switchWorkspace(
              {
                teamId: team?.teamId,
                teamName: team?.teamName,
                teamMembersCount: team?.teamAccessCount,
              },
              dispatch,
              {
                isWorkspaceMode,
                isSyncEnabled: true,
              },
              appMode
            );
          }
        }
        setIsJoining(false);
        handleModalClose();
      })
      .catch((err) => {
        toast.error("Error while accepting invitation. Please contact workspace admin");
        setIsJoining(false);
        handleModalClose();
      });
  };

  return (
    <li key={team.inviteId}>
      <div className="w-full team-invite-row">
        <Col>
          <Avatar
            size={28}
            shape="square"
            className="workspace-avatar"
            icon={team.teamName?.[0]?.toUpperCase() ?? "W"}
            style={{
              backgroundColor: `${getUniqueColorForWorkspace(team.teamId, team.teamName)}`,
            }}
          />
          <div>{team.teamName}</div>
        </Col>
        <div className="text-gray">{team.teamAccessCount} members</div>
        <Button loading={isJoining} type={index === 0 ? "primary" : "default"} onClick={() => handleJoinClick(team)}>
          {isJoining ? "Joining" : "Join"}
        </Button>
      </div>
    </li>
  );
};

const JoinWorkspaceModal: React.FC<JoinWorkspaceModalProps> = ({
  isOpen,
  teamInvites,
  allowCreateNewWorkspace = true,
  handleModalClose,
  handleCreateNewWorkspaceClick,
}) => {
  const dispatch = useDispatch();
  const sortedInvites = useMemo(() => teamInvites.sort((a, b) => b.teamAccessCount - a.teamAccessCount), [teamInvites]);

  useEffect(() => {
    if (isOpen) {
      const inviteIds = teamInvites.map((invite) => invite.inviteId);
      dispatch(actions.updateLastSeenInvites(inviteIds));
    }
  }, [dispatch, teamInvites, isOpen]);

  return (
    <RQModal centered open={isOpen} onCancel={handleModalClose} className="join-workspace-modal">
      <div className="rq-modal-content">
        {teamInvites?.length > 0 && (
          <div className="join-workspace-modal-header header">You have access to these workspaces</div>
        )}

        {sortedInvites?.length > 0 ? (
          <ul className="teams-invite-list">
            {sortedInvites.map((team: TeamInviteMetadata, index) => {
              return <InviteRow team={team} index={index} handleModalClose={handleModalClose} />;
            })}
          </ul>
        ) : (
          <div className="title teams-invite-empty-message">
            <img alt="smile" width="48px" height="44px" src="/assets/img/workspaces/smiles.svg" />
            <div>You don't have any workspace invites!</div>
          </div>
        )}
      </div>

      {/* footer */}
      <Row align="middle" justify="space-between" className="rq-modal-footer">
        <Col>
          <LearnMoreAboutWorkspace linkText="Learn more about team workspaces" />
        </Col>
        {allowCreateNewWorkspace && (
          <Col>
            <Button className="display-row-center" onClick={handleCreateNewWorkspaceClick}>
              <PlusOutlined /> Create new workspace
            </Button>
          </Col>
        )}
      </Row>
    </RQModal>
  );
};

export default JoinWorkspaceModal;
