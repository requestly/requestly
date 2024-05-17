import { BillingTeamMemberStatus } from "features/settings/components/BillingTeam/types";

export type AddMembersDrawerRecord = {
  email: string;
  status?: BillingTeamMemberStatus;
  domain: string;
};
