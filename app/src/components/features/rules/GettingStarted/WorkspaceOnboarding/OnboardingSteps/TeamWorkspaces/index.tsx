import React from "react";
import { CreateWorkspace } from "./WorkspaceCreation";
import { JoinWorkspace } from "./JoinWorkspace";
import "./index.css";

export const WorkspaceOnboardingStep: React.FC<any | null> = ({ createdTeamData, availableTeams }) => {
  return (
    <div className="workspace-onboarding-wrapper">
      <div className="workspace-onboarding-body">
        {createdTeamData ? (
          <CreateWorkspace createdTeamData={createdTeamData} />
        ) : availableTeams.length > 0 ? (
          <JoinWorkspace availableTeams={availableTeams} />
        ) : null}
      </div>
    </div>
  );
};
