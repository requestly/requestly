import { RQButton } from "lib/design-system-v2/components";
import "./createWorkspaceFooter.scss";

interface CreateWorkspaceFooterProps {
  onCancel: () => void;
  onCreateWorkspaceClick: () => void;
  isLoading: boolean;
}

export const CreateWorkspaceFooter = ({ onCancel, onCreateWorkspaceClick, isLoading }: CreateWorkspaceFooterProps) => {
  return (
    <>
      <div className="create-workspace-footer">
        <RQButton onClick={onCancel}>Cancel</RQButton>
        <RQButton type="primary" onClick={onCreateWorkspaceClick} loading={isLoading}>
          Create workspace
        </RQButton>
      </div>
    </>
  );
};
