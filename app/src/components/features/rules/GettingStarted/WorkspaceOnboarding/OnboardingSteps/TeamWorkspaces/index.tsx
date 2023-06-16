import React from "react";
import { CreateWorkspace } from "./WorkspaceCreation";
import { JoinWorkspace } from "./JoinWorkspace";
import "./index.css";
import { TeamWorkspace } from "types";

interface WorkspaceOnboardingStepProps {
  createdTeamData: any;
  availableTeams: TeamWorkspace[];
  isPendingInvite: boolean;
}

export const WorkspaceOnboardingStep: React.FC<WorkspaceOnboardingStepProps> = ({
  createdTeamData,
  availableTeams,
  isPendingInvite,
}) => {
  return (
    <div className="workspace-onboarding-wrapper">
      <div className="workspace-onboarding-body">
        {createdTeamData ? (
          <CreateWorkspace createdTeamData={createdTeamData} />
        ) : availableTeams.length > 0 ? (
          <JoinWorkspace availableTeams={availableTeams} isPendingInvite={isPendingInvite} />
        ) : null}
      </div>
    </div>
  );
};
