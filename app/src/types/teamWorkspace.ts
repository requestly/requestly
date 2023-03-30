export interface TeamWorkspace {
  id: string;
  name: string;
}

// teams invite
export enum InviteType {
  teams = "teams",
}

export enum InviteStatus {
  pending = "pending",
  revoked = "revoked",
  accepted = "accepted",
}
