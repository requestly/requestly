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
    ): { isValidPermission: true } | { isValidPermission: false; error: RBAC.Error } => {
      const result = validateResourcePermissionByRole(
        userRole,
        RBAC.Resource[resource],
        RBAC.Permission[permissionToCheck]
      );

      if (result.isValid === false) {
        return {
          isValidPermission: false,
          error: result.error,
        };
      } else {
        return {
          isValidPermission: true,
        };
      }
    },

    [userRole]
  );

  return { validatePermission };
};
