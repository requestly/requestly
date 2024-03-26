import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import { billingActions } from "store/features/billing/slice";
import { httpsCallable, getFunctions } from "firebase/functions";
import Logger from "lib/logger";

function useBillingTeamFetcher(hasAccessToBillingTeam: boolean, billingId: string) {
  const [isTeamMember, setIsTeamMember] = useState(false);
  const dispatch = useDispatch();
  const billingTeams = useSelector(getAvailableBillingTeams);

  useEffect(() => {
    if (!hasAccessToBillingTeam && billingId) {
      const getOtherTeam = httpsCallable(getFunctions(), "billing-fetchBillingTeam");
      getOtherTeam({ billingId })
        .then((result: any) => {
          if (result.data.success) {
            const newTeams = [...billingTeams, result.data.billingTeamData];
            dispatch(billingActions.setAvailableBillingTeams(newTeams));
            const formattedBillingTeamMembers = result.data.billingTeamMembers?.reduce((acc: any, curr: any) => {
              acc[curr.id] = curr;
              return acc;
            }, {});
            dispatch(
              billingActions.setBillingTeamMembers({ billingId, billingTeamMembers: formattedBillingTeamMembers })
            );
            setIsTeamMember(true);
          }
        })
        .catch((error) => {
          Logger.log(error);
        });
    }
  }, [billingId, hasAccessToBillingTeam, dispatch, billingTeams]);

  return isTeamMember;
}

export default useBillingTeamFetcher;
