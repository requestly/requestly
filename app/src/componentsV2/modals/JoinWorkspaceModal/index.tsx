import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAppMode, getIsJoinWorkspaceCardVisible } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { Button, Col, Row } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { RQModal } from "lib/design-system/components";
import { getUniqueTeamsFromInvites } from "utils/teams";
import { globalActions } from "store/slices/global/slice";
import { getPendingInvites, acceptTeamInvite } from "backend/workspace";
import { LearnMoreLink } from "components/common/LearnMoreLink";
import { toast } from "utils/Toast";
import { Invite, TeamInviteMetadata } from "types";
import { trackWorkspaceJoinClicked } from "modules/analytics/events/features/teams";
import APP_CONSTANTS from "config/constants";
import "./JoinWorkspaceModal.css";
import { trackCreateNewTeamClicked } from "modules/analytics/events/common/teams";
import { isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import WorkspaceAvatar from "features/workspaces/components/WorkspaceAvatar";
import { WorkspaceType } from "features/workspaces/types";

interface JoinWorkspaceModalProps {
  isOpen: boolean;
  toggleModal: () => void;
  callback?: () => void;
  source: string;
}

interface InviteRowProps {
  team: TeamInviteMetadata;
  callback: () => void;
  modalSrc: string;
}

const InviteRow: React.FC<InviteRowProps> = ({ team, callback, modalSrc }) => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const isJoinWorkspaceCardVisible = useSelector(getIsJoinWorkspaceCardVisible);
  const [isJoining, setIsJoining] = useState<boolean>(false);

  const handleJoinClick = (team: TeamInviteMetadata) => {
    trackWorkspaceJoinClicked(team?.teamId, modalSrc);
    setIsJoining(true);

    acceptTeamInvite(team?.inviteId)
      .then((res) => {
        if (res?.success) {
          toast.success("Successfully joined workspace");
          if (res?.data?.invite.type === "teams") {
            switchWorkspace(
              {
                teamId: team?.teamId,
                teamName: team?.teamName,
                teamMembersCount: team?.teamAccessCount,
              },
              dispatch,
              {
                isWorkspaceMode: isSharedWorkspaceMode,
                isSyncEnabled: true,
              },
              appMode,
              null,
              "join_workspace_modal"
            );
          }
        }
        if (isJoinWorkspaceCardVisible) dispatch(globalActions.updateJoinWorkspaceCardVisible(false));
        callback?.();
        setIsJoining(false);
        dispatch(globalActions.toggleActiveModal({ modalName: "joinWorkspaceModal", newValue: false }));
      })
      .catch(() => {
        toast.error("Error while accepting invitation. Please contact workspace admin");
        setIsJoining(false);
        dispatch(globalActions.toggleActiveModal({ modalName: "joinWorkspaceModal", newValue: false }));
      });
  };

  return (
    <li key={team.inviteId}>
      <div className="w-full team-invite-row">
        <Col>
          <WorkspaceAvatar
            workspace={{ id: team.teamId, name: team.teamName, workspaceType: WorkspaceType.SHARED }}
            size={28}
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

const JoinWorkspaceModal: React.FC<JoinWorkspaceModalProps> = ({ isOpen, toggleModal, callback, source }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [teamInvites, setTeamInvites] = useState<Invite[]>([]);

  useEffect(() => {
    if (user.loggedIn) {
      getPendingInvites({ email: true, domain: true })
        .then((res) => {
          const pendingInvites = res?.pendingInvites ?? [];
          const sortedInvites = pendingInvites
            ? pendingInvites.sort(
                (a: Invite, b: Invite) =>
                  (b.metadata.teamAccessCount as number) - (a.metadata.teamAccessCount as number)
              )
            : [];
          setTeamInvites(sortedInvites);
          dispatch(globalActions.updateLastSeenInviteTs(new Date().getTime()));
        })
        .catch((e) => setTeamInvites([]));
    }
  }, [user.loggedIn, dispatch]);

  const handleCreateNewWorkspace = () => {
    trackCreateNewTeamClicked("join_workspace_modal");
    toggleModal();
    if (user.loggedIn) {
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "createWorkspaceModal",
          newValue: true,
          newProps: { source: "join_workspace_modal" },
        })
      );
    } else {
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            callback: () =>
              dispatch(
                globalActions.toggleActiveModal({
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
              return <InviteRow team={team} callback={callback} modalSrc={source} />;
            })}
          </ul>
        ) : (
          <div className="title teams-invite-empty-message">
            <img alt="smile" width="48px" height="44px" src="/assets/media/common/smiles.svg" />
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
