import { RQButton } from "lib/design-system-v2/components";
import "./createWorkspaceFooter.scss";
import { Tooltip } from "antd";

interface CreateWorkspaceFooterProps {
  onCancel: () => void;
  onCreateWorkspaceClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const CreateWorkspaceFooter = ({
  onCancel,
  onCreateWorkspaceClick,
  isLoading,
  disabled,
}: CreateWorkspaceFooterProps) => {
  return (
    <>
      <div className="create-workspace-footer">
        <RQButton onClick={onCancel}>Cancel</RQButton>
        <Tooltip
          title={disabled ? "Please complete all required fields to continue." : null}
          color="#000"
          placement="top"
        >
          <RQButton type="primary" onClick={onCreateWorkspaceClick} loading={isLoading} disabled={disabled}>
            Create workspace
          </RQButton>
        </Tooltip>
      </div>
    </>
  );
};
