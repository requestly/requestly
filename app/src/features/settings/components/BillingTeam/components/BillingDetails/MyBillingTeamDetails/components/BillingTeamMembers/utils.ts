import { BillingAction } from "./types";
import { BillingTeamMemberStatus, BillingTeamRoles } from "features/settings/components/BillingTeam/types";

export const isMenuItemDisabled = (action: BillingAction, role: BillingTeamRoles, status: BillingTeamMemberStatus) => {
  if (action === BillingAction.MAKE_ADMIN) {
    if (role === BillingTeamRoles.Admin) {
      return true;
    }

    if (status === BillingTeamMemberStatus.PENDING) {
      return true;
    }
  }

  if (action === BillingAction.MAKE_MEMBER) {
    if (role === BillingTeamRoles.Member) {
      return true;
    }

    if (status === BillingTeamMemberStatus.PENDING) {
      return true;
    }
  }

  return false;
};
