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
  subscriptionDetails: Record<string, any>;
  members: {
    [userId: string]: {
      role: BillingTeamRoles;
      joiningDate: number;
    };
  };
  billingExclude?: string[];
  billedWorkspaces?: string[];
  seats: number;
  minUsers?: number;
  maxUsers?: number;
  isStripeIndia?: boolean;
}

export enum BillingTeamRoles {
  Manager = "manager",
  Admin = "admin",
  Member = "member",
}
