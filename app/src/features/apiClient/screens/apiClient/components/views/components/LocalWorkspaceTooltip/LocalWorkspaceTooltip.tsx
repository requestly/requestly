import { Tooltip } from "antd";
import { TooltipPlacement } from "antd/lib/tooltip";
import { useCheckLocalSyncSupport } from "features/apiClient/helpers/modules/sync/useCheckLocalSyncSupport";
import React, { ReactNode } from "react";

interface Props {
  featureName: string;
  children: ReactNode;
  placement?: TooltipPlacement;
}

export const LocalWorkspaceTooltip: React.FC<Props> = ({ featureName, children, placement = "right" }) => {
  const isLocalSyncEnabled = useCheckLocalSyncSupport();

  if (!isLocalSyncEnabled) return children;
  return (
    <Tooltip
      color="#000"
      placement={placement}
      title={`Local workspaces currently do not support ${featureName}. Use your Private or a Team Workspace instead.`}
    >
      {children}
    </Tooltip>
  );
};
