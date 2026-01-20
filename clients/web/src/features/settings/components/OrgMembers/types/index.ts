import { BillingTeamMemberStatus } from "../../BillingTeam/types";

export type OrgMember = {
  isVerified?: boolean;
  photoURL?: string;
  displayName?: string;
  domain: string;
  signupTs?: number;
  email: string;
  username?: string;
  status?: BillingTeamMemberStatus;
};
