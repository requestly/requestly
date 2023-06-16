import { Invite } from "./invite";

export interface TeamWorkspace {
  id: string;
  name: string;
  accessCount?: number;
  inviteId: string;
}

export enum TeamRole {
  admin = "admin",
  write = "write",
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
}

export interface TeamInvite extends Invite {
  metadata: TeamInviteMetadata;
}
