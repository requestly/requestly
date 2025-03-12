import React from "react";
import { useRBAC } from "features/rbac/hooks/useRBAC";
import { RBAC } from "features/rbac/types";
import { RQButton, RQButtonProps, RQTooltip } from "lib/design-system-v2/components";
import { TooltipProps } from "antd";

interface RBACButtonProps extends RQButtonProps {
  tooltipTitle?: string;
  tooltipPlacement?: TooltipProps["placement"];
  resource: keyof typeof RBAC.Resource;
  permission: keyof typeof RBAC.Permission;
}

export const RBACButton: React.FC<RBACButtonProps> = ({
  resource,
  permission,
  tooltipTitle = "Invalid permission",
  tooltipPlacement = "top",
  ...props
}) => {
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission(resource, permission);

  return (
    <RQTooltip title={isValidPermission ? null : tooltipTitle} placement={tooltipPlacement}>
      {/* HACK: React fragment allows applying tooltip on disabled button */}
      <>
        <RQButton {...props} disabled={props.disabled || !isValidPermission} />
      </>
    </RQTooltip>
  );
};
