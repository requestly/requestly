import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Skeleton } from "antd";
import { CreateWorkspace } from "./WorkspaceCreation";
import { JoinWorkspace } from "./JoinWorkspace";
import { Invite, TeamInviteMetadata } from "types";
import { NewTeamData, OnboardingSteps } from "../../types";
import { getUniqueTeamsFromInvites } from "utils/teams";
import { actions } from "store";
import "./index.css";

interface WorkspaceOnboardingStepProps {
  defaultTeamData: NewTeamData | null;
  pendingInvites: Invite[];
  isPendingInvite: boolean;
}

export const WorkspaceOnboardingStep: React.FC<WorkspaceOnboardingStepProps> = ({
  defaultTeamData,
  pendingInvites,
  isPendingInvite,
}) => {
  const dispatch = useDispatch();
  const [createNewTeam, setCreatNewTeam] = useState<boolean>(false);

  const availableTeams: TeamInviteMetadata[] = useMemo(() => {
    return getUniqueTeamsFromInvites(pendingInvites);
  }, [pendingInvites]);

  useEffect(() => {
    if (!defaultTeamData && !createNewTeam && !availableTeams.length) {
      dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.RECOMMENDATIONS));
    }
  }, [defaultTeamData, createNewTeam, availableTeams.length]);

  return (
    <div className="workspace-onboarding-wrapper">
      <div className="workspace-onboarding-body">
        {defaultTeamData || createNewTeam ? (
          <CreateWorkspace defaultTeamData={defaultTeamData} />
        ) : availableTeams.length > 0 ? (
          <JoinWorkspace
            availableTeams={availableTeams}
            isPendingInvite={isPendingInvite}
            createNewTeam={() => setCreatNewTeam(true)}
          />
        ) : (
          <Skeleton />
        )}
      </div>
    </div>
  );
};
