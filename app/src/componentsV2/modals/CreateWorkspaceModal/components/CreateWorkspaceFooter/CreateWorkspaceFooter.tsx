import { useState } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { Tooltip } from "antd";
import "./createWorkspaceFooter.scss";

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
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  return (
    <>
      <div className="create-workspace-footer">
        <RQButton onClick={onCancel}>Cancel</RQButton>
        {/* Tooltip does not work when button is disabled, so we need to use onMouseOver and onMouseLeave to show/hide the tooltip */}
        <Tooltip
          open={isTooltipVisible}
          title={"Please complete all required fields to continue."}
          color="#000"
          placement="top"
        >
          <RQButton
            type="primary"
            onClick={onCreateWorkspaceClick}
            loading={isLoading}
            disabled={disabled}
            onMouseOver={() => {
              if (disabled) setIsTooltipVisible(true);
            }}
            onMouseLeave={() => {
              if (disabled) setIsTooltipVisible(false);
            }}
          >
            Create workspace
          </RQButton>
        </Tooltip>
      </div>
    </>
  );
};
