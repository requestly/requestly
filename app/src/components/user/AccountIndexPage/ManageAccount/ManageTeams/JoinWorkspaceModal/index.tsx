import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserAuthDetails } from "store/selectors";
import { Avatar, Button, Col, Row } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { RQModal } from "lib/design-system/components";
import { getUniqueColorForWorkspace, getUniqueTeamsFromInvites } from "utils/teams";
import { actions } from "store";
import { getPendingInvites } from "backend/workspace";
import { LearnMoreLink } from "components/common/LearnMoreLink";
import { Invite, TeamInviteMetadata } from "types";
import { trackWorkspaceJoinClicked } from "modules/analytics/events/features/teams";
import APP_CONSTANTS from "config/constants";
import "./JoinWorkspaceModal.css";

interface JoinWorkspaceModalProps {
  isOpen: boolean;
  toggleModal: () => void;
}

const JoinWorkspaceModal: React.FC<JoinWorkspaceModalProps> = ({ isOpen, toggleModal }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [teamInvites, setTeamInvites] = useState<Invite[]>([]);

  const handleJoinClick = (teamId: string, inviteId: string) => {
    toggleModal();
    navigate(`/invite/${inviteId}`);
    trackWorkspaceJoinClicked(teamId, "workspace_joining_modal");
  };

  useEffect(() => {
    if (user.loggedIn) {
      getPendingInvites({ email: true, domain: false })
        .then((res: any) => {
          const pendingInvites = res?.pendingInvites ?? [];
          setTeamInvites(pendingInvites);
          dispatch(actions.updateLastSeenInvitesTs(new Date().getTime()));
        })
        .catch((e) => setTeamInvites([]));
    }
  }, [user.loggedIn, dispatch]);

  const handleCreateNewWorkspace = () => {
    toggleModal();
    if (user.loggedIn) {
      dispatch(actions.toggleActiveModal({ modalName: "createWorkspaceModal", newValue: true }));
    } else {
      dispatch(
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            callback: () => dispatch(actions.toggleActiveModal({ modalName: "createWorkspaceModal", newValue: true })),
            redirectURL: window.location.href,
            src: APP_CONSTANTS.FEATURES.WORKSPACES,
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
            eventSource: "join_workspace_modal",
          },
        })
      );
    }
  };

  return (
    <RQModal centered open={isOpen} onCancel={toggleModal} className="join-workspace-modal">
      <div className="rq-modal-content">
        {teamInvites?.length > 0 && (
          <div className="join-workspace-modal-header header">You have access to these workspaces</div>
        )}

        {teamInvites?.length > 0 ? (
          <ul className="teams-invite-list">
            {getUniqueTeamsFromInvites(teamInvites).map((team: TeamInviteMetadata) => (
              <li key={team.inviteId}>
                <Row wrap={false} align="middle" justify="space-between" className="w-full team-invite-row">
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

                  <Button type="primary" onClick={() => handleJoinClick(team.teamId, team.inviteId)}>
                    Join
                  </Button>
                </Row>
              </li>
            ))}
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
          <LearnMoreLink
            linkText="Learn more about team workspaces"
            href={APP_CONSTANTS.LINKS.DEMO_VIDEOS.TEAM_WORKSPACES}
          />
        </Col>
        <Col>
          <Button className="display-row-center" onClick={handleCreateNewWorkspace}>
            <PlusOutlined /> Create new workspace
          </Button>
        </Col>
      </Row>
    </RQModal>
  );
};

export default JoinWorkspaceModal;
