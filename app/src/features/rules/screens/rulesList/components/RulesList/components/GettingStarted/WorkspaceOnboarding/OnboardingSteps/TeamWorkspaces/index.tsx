import React, { useMemo, useState } from "react";
import { Skeleton } from "antd";
import { CreateWorkspace } from "./WorkspaceCreation";
import { JoinWorkspace } from "./JoinWorkspace";
import "./index.css";
import { Invite, TeamInviteMetadata } from "types";
import { NewTeamData } from "../../types";
import { getUniqueTeamsFromInvites } from "utils/teams";

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
  const [createNewTeam, setCreatNewTeam] = useState<boolean>(false);

  const availableTeams: TeamInviteMetadata[] = useMemo(() => {
    return getUniqueTeamsFromInvites(pendingInvites);
  }, [pendingInvites]);

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
