import { RBAC } from "../types";

const createResourcePermissions = (permissions: RBAC.ResourcePermissions): RBAC.ResourceToPermissionMap => {
  return Object.values(RBAC.Resource).reduce((result, resource) => {
    return {
      ...result,
      [resource]: {
        read: permissions.read,
        create: permissions.create,
        update: permissions.update,
        delete: permissions.delete,
      },
    };
  }, {} as RBAC.ResourceToPermissionMap);
};

export const ROLE_TO_RESOURCE_PERMISSIONS_MAP: Record<RBAC.Role, RBAC.ResourceToPermissionMap> = {
  [RBAC.Role.admin]: createResourcePermissions({ read: true, create: true, update: true, delete: true }),
  [RBAC.Role.write]: createResourcePermissions({ read: true, create: true, update: true, delete: true }),
  [RBAC.Role.read]: createResourcePermissions({ read: true, create: false, update: false, delete: false }),
};
