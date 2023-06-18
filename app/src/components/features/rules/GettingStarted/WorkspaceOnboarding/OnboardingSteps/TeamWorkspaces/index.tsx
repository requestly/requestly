import React, { useState } from "react";
import { CreateWorkspace } from "./WorkspaceCreation";
import { JoinWorkspace } from "./JoinWorkspace";
import "./index.css";
import { Team } from "types";
import { NewTeamData } from "../../types";

interface WorkspaceOnboardingStepProps {
  defaultTeamData: NewTeamData | null;
  availableTeams: Team[];
  isPendingInvite: boolean;
}

export const WorkspaceOnboardingStep: React.FC<WorkspaceOnboardingStepProps> = ({
  defaultTeamData,
  availableTeams,
  isPendingInvite,
}) => {
  const [createNewTeam, setCreatNewTeam] = useState<boolean>(false);
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
        ) : null}
      </div>
    </div>
  );
};
