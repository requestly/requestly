import { BillingTeamDetails } from "features/settings/components/BillingTeam/types";
import { ReducerKeys } from "store/constants";
import { RootState } from "store/types";

export const getAvailableBillingTeams = (state: RootState): BillingTeamDetails[] => {
  return state[ReducerKeys.BILLING].availableBillingTeams;
};

export const getBillingTeamById = (id: string | undefined) => (state: RootState): BillingTeamDetails | undefined => {
  if (!id) {
    return;
  }

  const allAvailableBillingTeams = getAvailableBillingTeams(state);
  return allAvailableBillingTeams.find((billingTeam) => billingTeam.id === id);
};

export const getBillingTeamMembers = (billingId: string | undefined) => (state: RootState): Record<string, any> => {
  if (!billingId) {
    return {};
  }

  return state[ReducerKeys.BILLING].billingTeamMembers[billingId];
};

export const getBillingTeamMemberById = (billingId: string, memberId: string) => (
  state: RootState
): Record<string, any> => {
  return state[ReducerKeys.BILLING]?.billingTeamMembers[billingId]?.[memberId];
};

export const getIsBillingTeamsLoading = (state: RootState): boolean => {
  return state[ReducerKeys.BILLING].isBillingTeamsLoading;
};
