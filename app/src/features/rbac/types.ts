import { TeamRole } from "types";

export namespace RBAC {
  export enum Resource {
    http_rule = "http_rule",
    api_client_request = "api_client_request",
    api_client_collection = "api_client_collection",
    api_client_environment = "api_client_environment",
    mock_api = "mock_api",
    mock_collection = "mock_collection",
    session_recording = "session_recording",
    network_sessions = "network_sessions",
    workspace = "workspace",
    workspace_settings_synced_status = "workspace_settings_synced_status",
    breadcrumbs = "breadcrumbs",
    tabs_layout = "tabs_layout",
    global_settings = "global_settings",
  }

  // Keep this updated with TeamRole
  export enum Role {
    admin = TeamRole.admin,
    write = TeamRole.write,
    read = TeamRole.read,
  }

  export enum Permission {
    read = "read",
    create = "create",
    update = "update",
    delete = "delete",
  }

  export type ResourcePermissions = Record<Permission, boolean>;

  export type ResourceToPermissionMap = Record<Resource, ResourcePermissions>;

  export enum Error {
    "not_allowed" = "not_allowed",
    "invalid_role" = "invalid_role",
    "invalid_resource" = "invalid_resource",
    "invalid_permission" = "invalid_permission",
  }
}
