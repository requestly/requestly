import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAppMode } from "store/selectors";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { actions } from "store";
import { Avatar } from "antd";
import { RQButton } from "lib/design-system/components";
import { PlusOutlined } from "@ant-design/icons";
import { TeamInviteMetadata } from "types";
import { acceptTeamInvite } from "backend/workspace";
import { toast } from "utils/Toast";
import { redirectToRules } from "utils/RedirectionUtils";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { trackOnboardingWorkspaceSkip } from "modules/analytics/events/common/teams";
import { OnboardingSteps } from "../../types";
import { trackWorkspaceInviteAccepted } from "modules/analytics/events/features/teams";

const Workspace: React.FC<{ team: TeamInviteMetadata }> = ({ team }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const appMode = useSelector(getAppMode);

  const [isJoining, setIsJoining] = useState<boolean>(false);

  const handleJoinWorkspace = () => {
    setIsJoining(true);
    acceptTeamInvite(team.inviteId)
      .then((res: any) => {
        if (res?.data?.success) {
          toast.success("Successfully accepted invite");
          trackWorkspaceInviteAccepted(
            team.teamId,
            team.teamName,
            team.inviteId,
            "onboarding",
            res?.data?.data?.invite?.usage,
            res?.data?.data?.invite?.metadata?.teamAccessCount
          );

          if (res?.data?.data?.invite.type === "teams") {
            switchWorkspace(
              {
                teamId: team.teamId,
                teamName: team.teamName,
                teamMembersCount: team.accessCount,
              },
              dispatch,
              {
                isWorkspaceMode,
                isSyncEnabled: true,
              },
              appMode
            );
            redirectToRules(navigate);
          }
        }
        setIsJoining(false);
        dispatch(actions.updateIsWorkspaceOnboardingCompleted());
      })
      .catch((err) => {
        toast.error("Error while accepting invitation. Please contact workspace admin");
        setIsJoining(false);
      });
  };

  return (
    <div className="workspace-list-card">
      <div className="display-flex">
        <Avatar
          size={28}
          shape="square"
          className="workspace-avatar"
          icon={<>{team?.teamName?.charAt(0)?.toUpperCase()}</>}
        />
        <span className="text-bold workspace-list-card-name">{team?.teamName}</span>
      </div>
      <div className="text-gray">{`${team.teamAccessCount ?? team.accessCount} members`}</div>
      <RQButton loading={isJoining} className="text-bold" type="primary" onClick={handleJoinWorkspace}>
        {isJoining ? "Joining" : "Join"}
      </RQButton>
    </div>
  );
};

export const JoinWorkspace: React.FC<{
  availableTeams: TeamInviteMetadata[];
  isPendingInvite: boolean;
  createNewTeam?: () => void;
}> = ({ availableTeams, isPendingInvite, createNewTeam }) => {
  const dispatch = useDispatch();

  return (
    <>
      <div className="header text-center">
        {isPendingInvite ? "You have invitation to join workspace" : "We found your team on Requestly"}
      </div>
      <div className="display-row-center mt-20">
        <div className="text-gray text-center" style={{ width: "380px" }}>
          Join your teams workspace and get access to shared rules, mock APIs & session replays.
        </div>
      </div>
      <div className="mt-20 onboarding-invites-list">
        {availableTeams.map((team) => (
          <Workspace team={team} />
        ))}
      </div>

      <div className="workspace-onboarding-footer">
        <RQButton
          type="text"
          onClick={() => {
            trackOnboardingWorkspaceSkip(OnboardingSteps.CREATE_JOIN_WORKSPACE);
            dispatch(actions.updateIsWorkspaceOnboardingCompleted());
          }}
        >
          Skip for now
        </RQButton>
        <RQButton type="default" className="text-bold" onClick={createNewTeam} icon={<PlusOutlined />}>
          Create new workspace
        </RQButton>
      </div>
    </>
  );
};
