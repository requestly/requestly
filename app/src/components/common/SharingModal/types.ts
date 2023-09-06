import { Group, Rule } from "types";

export enum SharingOptions {
  WORKSPACE = "workspace",
  SHARE_LINK = "share_link",
  DOWNLOAD = "download",
}

export enum SharedLinkVisibility {
  PUBLIC = "public",
  PRIVATE = "custom",
}

export type SharedListData = {
  rules: Rule[];
  updatedGroups: Group[];
  sharedListName: string;
  sharedListVisibility: SharedLinkVisibility;
  sharedListRecipients: unknown;
};

export enum WorkspaceSharingTypes {
  NEW_WORKSPACE_CREATED = "new_workspace_created",
  USERS_INVITED = "users_invites",
  EXISTING_WORKSPACE = "existing_workspace",
}

export type PostSharingData = {
  type: WorkspaceSharingTypes;
  teamData: {
    teamId: string;
    teamName: string;
    accessCount: number;
  };
};
