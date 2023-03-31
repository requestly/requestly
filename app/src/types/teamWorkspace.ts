export interface TeamWorkspace {
  id: string;
  name: string;
}

export enum TeamRole {
  admin = "admin",
  write = "write",
}

// invite
export enum InviteType {
  teams = "teams",
}

export enum InviteStatus {
  pending = "pending",
  revoked = "revoked",
  accepted = "accepted",
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

export type InviteMetadata = TeamInviteMetadata | { [key: string]: string };

export enum InviteUsage {
  once = "once",
  unlimited = "unlimited",
}

export interface Invite {
  email?: string | null;
  usage: InviteUsage;
  usageCount: number;
  status: InviteStatus;
  ownerId: string; // Who invited the user
  type: InviteType;
  metadata?: InviteMetadata;
  createdTs: number;
  updatedTs: number;
  expireTs: number;
  lastEmailTs?: number | null;
}
