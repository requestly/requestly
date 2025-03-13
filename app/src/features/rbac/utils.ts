import { ROLE_TO_RESOURCE_PERMISSIONS_MAP } from "./constants/config";
import { RBAC } from "./types";

export const validateResourcePermissionByRole = (
  role: RBAC.Role | undefined,
  resource: RBAC.Resource,
  permissionToValidate: RBAC.Permission
): { isValidPermission: boolean } => {
  const resourcePermissions = ROLE_TO_RESOURCE_PERMISSIONS_MAP[role]?.[resource];
  const isAllowed = resourcePermissions?.[permissionToValidate];
  if (!isAllowed) {
    return {
      isValidPermission: false,
    };
  }

  return { isValidPermission: true };
};
