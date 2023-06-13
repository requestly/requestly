import { CreateWorkspace } from "./WorkspaceCreation";
import "./index.css";
export const WorkspaceOnboardingStep = () => {
  return (
    <div className="workspace-onboarding-wrapper">
      <div className="workspace-onboarding-body">
        <CreateWorkspace />
      </div>
    </div>
  );
};
