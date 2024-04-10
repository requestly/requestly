import { BillingAction } from "./types";
import { BillingTeamRoles } from "features/settings/components/BillingTeam/types";

export const isMenuItemDisabled = (action: BillingAction, role: BillingTeamRoles) => {
  if (action === BillingAction.MAKE_ADMIN && role === BillingTeamRoles.Admin) return true;
  if (action === BillingAction.MAKE_MEMBER && role === BillingTeamRoles.Member) return true;
};
