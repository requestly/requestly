import { BillingTeamDetails } from "./types";

export const isWorkspaceMappedToBillingTeam = (workspaceId: string, billingTeams: BillingTeamDetails[]) => {
  return billingTeams.some((team) => team.billedWorkspaces?.includes(workspaceId));
};
