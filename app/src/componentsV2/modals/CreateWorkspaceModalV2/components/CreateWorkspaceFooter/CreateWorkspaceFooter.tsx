import { RQButton } from "lib/design-system-v2/components";
import "./createWorkspaceFooter.scss";

export const CreateWorkspaceFooter = () => {
  return (
    <>
      <div className="create-workspace-footer">
        <RQButton>Cancel</RQButton>
        <RQButton type="primary">Create workspace</RQButton>
      </div>
    </>
  );
};
