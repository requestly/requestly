export enum PlanStatus {
  ACTIVE = "active",
  EXPIRING_SOON = "expiring soon",
  EXPIRED = "expired",
}

export interface BillingTeamDetails {
  id: string;
  name: string;
  description: string;
  owner: string;
  ownerDomain?: string;
  subscriptionDetails: Record<string, any>;
  members: Record<string, BillingTeamMember>;
  billingExclude?: string[];
  billedWorkspaces?: string[];
  seats: number;
  minUsers?: number;
  maxUsers?: number;
  isStripeIndia?: boolean;
  pendingMembers?: string[];
}

export enum BillingTeamRoles {
  Manager = "manager",
  Admin = "admin",
  Member = "member",
}

export interface BillingTeamMember {
  role: BillingTeamRoles;
  joiningDate: number;
}

export enum BillingTeamMemberStatus {
  PENDING = "pending",
}
