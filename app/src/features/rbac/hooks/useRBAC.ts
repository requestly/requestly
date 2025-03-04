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

  const getErrorMessage = useCallback(
    (error: RBAC.Error, permission: RBAC.Permission): ((entityName?: string) => string) => {
      const roleToDisplayTextMapping = {
        [RBAC.Role.admin]: "admin",
        [RBAC.Role.write]: "write",
        [RBAC.Role.read]: "viewer",
      };

      switch (error) {
        case RBAC.Error.not_allowed: {
          return (entityName: string) => {
            return `As a ${roleToDisplayTextMapping[userRole]}, you cannot ${permission} ${entityName}. Contact your workspace admin to update your role.`;
          };
        }
        case RBAC.Error.invalid_role:
          return () => `INTERNAL: '${userRole}' is not a recognized role.`;
        case RBAC.Error.invalid_resource:
          return () => `INTERNAL: Not a valid resource.`;
        case RBAC.Error.invalid_permission:
          return () => `INTERNAL: '${permission}' is not a valid permission.`;
        default:
          return () => `INTERNAL: Something went wrong! role=${userRole} error=${error} permission=${permission}`;
      }
    },
    [userRole]
  );

  return { validatePermission, getErrorMessage };
};
