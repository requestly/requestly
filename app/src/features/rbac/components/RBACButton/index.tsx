import React from "react";
import { useRBAC } from "features/rbac/hooks/useRBAC";
import { RBAC } from "features/rbac/types";
import { RQButton, RQButtonProps, RQTooltip } from "lib/design-system-v2/components";
import { TooltipProps } from "antd";
import { toast } from "utils/Toast";

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

  const showInvalidPermissionToast = () => {
    toast.warn("Cannot save changes in view-only mode.");
  };

  const onClick = props.hotKey ? (isValidPermission ? props.onClick : showInvalidPermissionToast) : props.onClick;

  return (
    <RQTooltip showArrow={false} title={isValidPermission ? null : tooltipTitle} placement={tooltipPlacement}>
      {/* HACK: React fragment allows applying tooltip on disabled button */}
      <>
        <RQButton {...props} disabled={props.disabled || !isValidPermission} onClick={onClick} />
      </>
    </RQTooltip>
  );
};
