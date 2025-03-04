import { ROLE_TO_RESOURCE_PERMISSIONS_MAP } from "./constants/config";
import { RBAC } from "./types";

export const validateResourcePermissionByRole = (
  role: RBAC.Role,
  resource: RBAC.Resource,
  permissionToValidate: RBAC.Permission
):
  | {
      isValid: true;
    }
  | { isValid: false; error: RBAC.Error } => {
  const resourcePermissions = ROLE_TO_RESOURCE_PERMISSIONS_MAP[role][resource];
  const isAllowed = resourcePermissions[permissionToValidate];
  if (!isAllowed) {
    return {
      isValid: false,
      error: RBAC.Error.not_allowed,
    };
  }

  return { isValid: true };
};
