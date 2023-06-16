import React from "react";
import { CreateWorkspace } from "./WorkspaceCreation";
// import { JoinWorkspace } from "./JoinWorkspace";
import "./index.css";

export const WorkspaceOnboardingStep: React.FC<any | null> = ({ createdTeamData }) => {
  return (
    <div className="workspace-onboarding-wrapper">
      <div className="workspace-onboarding-body">
        <CreateWorkspace createdTeamData={createdTeamData} />
        {/* <JoinWorkspace /> */}
      </div>
    </div>
  );
};
