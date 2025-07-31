import { useCallback } from "react";
import { RBAC } from "../types";
import { validateResourcePermissionByRole } from "../utils";
import { useCurrentWorkspaceUserRole } from "hooks";

export const useRBAC = () => {
  const { role } = useCurrentWorkspaceUserRole();
  const userRole = (role as unknown) as RBAC.Role;

  const validatePermission = useCallback(
    (
      resource: keyof typeof RBAC.Resource,
      permissionToCheck: keyof typeof RBAC.Permission
    ): { isValidPermission: boolean } => {
      const result = validateResourcePermissionByRole(
        userRole,
        RBAC.Resource[resource],
        RBAC.Permission[permissionToCheck]
      );

      return {
        isValidPermission: result.isValidPermission,
      };
    },
    [userRole]
  );

  const getRBACValidationFailureErrorMessage = useCallback(
    (permission: RBAC.Permission, entityName: string): string => {
      const roleToDisplayTextMapping = {
        [RBAC.Role.admin]: "admin",
        [RBAC.Role.write]: "write",
        [RBAC.Role.read]: "viewer",
      };

      return `As a ${roleToDisplayTextMapping[userRole]}, you cannot ${permission} ${entityName}. Contact your workspace admin to update your role.`;
    },
    [userRole]
  );

  return { validatePermission, getRBACValidationFailureErrorMessage };
};
