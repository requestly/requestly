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
