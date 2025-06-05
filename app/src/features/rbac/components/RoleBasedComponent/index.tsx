import React from "react";
import { useRBAC } from "features/rbac/hooks/useRBAC";
import { RBAC } from "features/rbac/types";

interface Props {
  resource: keyof typeof RBAC.Resource;
  permission: keyof typeof RBAC.Permission;
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleBasedComponent: React.FC<Props> = ({ resource, permission, children = null, fallback = null }) => {
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission(resource, permission);

  return isValidPermission ? children : fallback;
};
