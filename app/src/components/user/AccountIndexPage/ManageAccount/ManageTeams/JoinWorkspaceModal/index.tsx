import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails, getAppMode, getIsJoinWorkspaceCardVisible } from "store/selectors";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { Avatar, Button, Col, Row } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { RQModal } from "lib/design-system/components";
import { getUniqueColorForWorkspace, getUniqueTeamsFromInvites } from "utils/teams";
import { actions } from "store";
import { getPendingInvites, acceptTeamInvite } from "backend/workspace";
import { LearnMoreLink } from "components/common/LearnMoreLink";
import { toast } from "utils/Toast";
import { Invite, TeamInviteMetadata } from "types";
import { trackWorkspaceJoinClicked } from "modules/analytics/events/features/teams";
import APP_CONSTANTS from "config/constants";
import "./JoinWorkspaceModal.css";
import { trackCreateNewTeamClicked } from "modules/analytics/events/common/teams";

interface JoinWorkspaceModalProps {
  isOpen: boolean;
  toggleModal: () => void;
  callback?: () => void;
}

interface InviteRowProps {
  team: TeamInviteMetadata;
  callback: () => void;
}

const InviteRow: React.FC<InviteRowProps> = ({ team, callback }) => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const isJoinWorkspaceCardVisible = useSelector(getIsJoinWorkspaceCardVisible);
  const [isJoining, setIsJoining] = useState<boolean>(false);

  const handleJoinClick = (team: TeamInviteMetadata) => {
    trackWorkspaceJoinClicked(team?.teamId, "join_workspace_modal");
    setIsJoining(true);

    acceptTeamInvite(team?.inviteId)
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
              appMode,
              null,
              "join_workspace_modal"
            );
          }
        }
        if (isJoinWorkspaceCardVisible) dispatch(actions.updateJoinWorkspaceCardVisible(false));
        callback?.();
        setIsJoining(false);
        dispatch(actions.toggleActiveModal({ modalName: "joinWorkspaceModal", newValue: false }));
      })
      .catch((err) => {
        toast.error("Error while accepting invitation. Please contact workspace admin");
        setIsJoining(false);
        dispatch(actions.toggleActiveModal({ modalName: "joinWorkspaceModal", newValue: false }));
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
        <Button loading={isJoining} type="primary" onClick={() => handleJoinClick(team)}>
          {isJoining ? "Joining" : "Join"}
        </Button>
      </div>
    </li>
  );
};

const JoinWorkspaceModal: React.FC<JoinWorkspaceModalProps> = ({ isOpen, toggleModal, callback }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [teamInvites, setTeamInvites] = useState<Invite[]>([]);

  useEffect(() => {
    if (user.loggedIn) {
      getPendingInvites({ email: true, domain: true })
        .then((res: any) => {
          const pendingInvites = res?.pendingInvites ?? [];
          const sortedInvites = pendingInvites
            ? pendingInvites.sort(
                (a: Invite, b: Invite) =>
                  (b.metadata.teamAccessCount as number) - (a.metadata.teamAccessCount as number)
              )
            : [];
          setTeamInvites(sortedInvites);
          dispatch(actions.updateLastSeenInviteTs(new Date().getTime()));
        })
        .catch((e) => setTeamInvites([]));
    }
  }, [user.loggedIn, dispatch]);

  const handleCreateNewWorkspace = () => {
    trackCreateNewTeamClicked("join_workspace_modal");
    toggleModal();
    if (user.loggedIn) {
      dispatch(
        actions.toggleActiveModal({
          modalName: "createWorkspaceModal",
          newValue: true,
          newProps: { source: "join_workspace_modal" },
        })
      );
    } else {
      dispatch(
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            callback: () =>
              dispatch(
                actions.toggleActiveModal({
                  modalName: "createWorkspaceModal",
                  newValue: true,
                  newProps: { source: "join_workspace_modal" },
                })
              ),
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
            {getUniqueTeamsFromInvites(teamInvites).map((team: TeamInviteMetadata, index) => {
              return <InviteRow team={team} callback={callback} />;
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
