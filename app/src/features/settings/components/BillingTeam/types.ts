export enum PlanStatus {
  ACTIVE = "active",
  EXPIRING_SOON = "expiring soon",
  EXPIRED = "expired",
}

export enum PlanType {
  TEAM = "team",
  INDIVIDUAL = "individual",
  STUDENT = "student",
  APPSUMO = "appsumo",
  SIGNUP_TRIAL = "signup_trial",
  GITHUB_STUDENT_PACK = "github-student-pack",
}

export interface BillingTeamDetails {
  id: string;
  name: string;
  description: string;
  owner: string;
  ownerDomains?: string[];
  subscriptionDetails: Record<string, any>;
  members: Record<string, BillingTeamMember>;
  billingExclude?: string[];
  billedWorkspaces?: string[];
  seats: number;
  minUsers?: number;
  maxUsers?: number;
  isStripeIndia?: boolean;
  pendingMembers?: {
    [email: string]: {
      inviteId: string;
    };
  };
  isAcceleratorTeam?: boolean;
  browserstackGroupId?: string;
  migratedToBrowserstack?: boolean;
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
