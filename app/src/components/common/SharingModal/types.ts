import { Group as NewGroup, Rule as NewRule } from "@requestly/shared/types/entities/rules";
import { Workspace } from "features/workspaces/types";

export enum SharingOptions {
  WORKSPACE = "workspace",
  SHARE_LINK = "share_link",
  DOWNLOAD = "download",
}

export enum SharedLinkVisibility {
  PUBLIC = "public",
  PRIVATE = "custom",
}

// TODO: move into shared module
export type SharedListData = {
  rules: NewRule[];
  updatedGroups: NewGroup[];
  sharedListName: string;
  sharedListVisibility: SharedLinkVisibility;
  sharedListRecipients: unknown;
  notifyOnImport: boolean;
  importCount?: number;
  teamId?: string;
};

export enum WorkspaceSharingTypes {
  NEW_WORKSPACE_CREATED = "new_workspace_created",
  USERS_INVITED = "users_invites",
  EXISTING_WORKSPACE = "existing_workspace",
}

export type PostShareViewData = {
  type: WorkspaceSharingTypes;
  targetTeamData?: Workspace;
  sourceTeamData?: Workspace | null;
};
