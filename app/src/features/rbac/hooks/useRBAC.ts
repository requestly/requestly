import { useCallback } from "react";
import { RBAC } from "../types";
import { validateResourcePermissionByRole } from "../utils";
import { useCurrentWorkspaceUserRole } from "hooks";

export const useRBAC = (resource: RBAC.Resource) => {
  const { role } = useCurrentWorkspaceUserRole();
  const userRole = (role as unknown) as RBAC.Role;

  const validatePermission = useCallback(
    (permissionToCheck: RBAC.Permission): { isValid: true } | { isValid: false; error: RBAC.Error } => {
      const result = validateResourcePermissionByRole(userRole, resource, permissionToCheck);

      if (result.isValid === false) {
        return {
          isValid: false,
          error: result.error,
        };
      } else {
        return {
          isValid: true,
        };
      }
    },

    [userRole, resource]
  );

  return { validatePermission };
};
