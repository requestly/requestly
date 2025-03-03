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

export const generateErrorMessage = ({
  error,
  role,
  resource,
  permission,
}: {
  error: RBAC.Error;
  role: RBAC.Role;
  resource: RBAC.Resource;
  permission: RBAC.Permission;
}): string => {
  return {
    [RBAC.Error.not_allowed]: `Access Denied: Role '${role}' does not have '${permission}' permission.`,
    [RBAC.Error.invalid_role]: `INTERNAL: '${role}' is not a recognized role.`,
    [RBAC.Error.invalid_resource]: `INTERNAL: '${resource}' is not a valid resource.`,
    [RBAC.Error.invalid_permission]: `INTERNAL: '${permission}' is not a valid permission for resource '${resource}'.`,
  }[error];
};
