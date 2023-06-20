export enum InviteType {
  teams = "teams",
}

export enum InviteUsage {
  once = "once",
  unlimited = "unlimited",
}

export enum InviteStatus {
  pending = "pending",
  revoked = "revoked",
  accepted = "accepted",
}

export type InviteMetadata = Record<string, unknown>;

export interface Invite {
  id?: string;
  email?: string | null;
  usageCount: number;
  ownerId: string; // Who invited the user
  type: InviteType;
  usage: InviteUsage;
  status: InviteStatus;
  metadata?: InviteMetadata;
  createdTs: number;
  updatedTs: number;
  expireTs: number;
  lastEmailTs?: number | null;
  public: boolean;
  domains?: string[];
}
