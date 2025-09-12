import { WorkspaceType } from "features/workspaces/types";
import { Invite } from "./invite";

export interface TeamWorkspace {
  id: string;
  name: string;
  accessCount?: number;
  inviteId: string;
}

export interface Team {
  id?: string;
  name: string;
  accessCount: number;
  access: string[];
  admins: string[];
  adminCount: number;
  appsumo?: boolean;
  workspaceType?: WorkspaceType;
  members: {
    [ownerId: string]: {
      role: TeamRole;
    };
  };
  owner: string;
  inviteId?: string;
  rootPath?: string;
}

export enum TeamRole {
  admin = "admin",
  write = "write",
  read = "read",
}

// teams invite
export interface TeamInviteMetadata extends Record<string, unknown> {
  teamId: string;
  teamRole: TeamRole;
  ownerDisplayName?: string;
  ownerEmail?: string;
  teamName?: string;
  teamAccessCount?: number;
  plan?: string;
  inviteId?: string;
}

export interface TeamInvite extends Invite {
  metadata: TeamInviteMetadata;
}

interface BaseCreateTeamParams {
  teamId?: string;
  teamName: string;
}

export interface LocalWorkspaceConfig {
  type: WorkspaceType.LOCAL;
  rootPath: string;
}

export interface SharedOrPrivateWorkspaceConfig {
  type: WorkspaceType.SHARED | WorkspaceType.PERSONAL;
  generatePublicLink?: boolean;
}

export type CreateTeamParams = BaseCreateTeamParams & {
  config: LocalWorkspaceConfig | SharedOrPrivateWorkspaceConfig;
};
