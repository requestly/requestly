import { useCallback, useEffect } from "react";
import firebaseApp from "../../../firebase";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { collection, getFirestore, onSnapshot, or, query, where } from "firebase/firestore";
import { BillingTeamDetails } from "features/settings/components/BillingTeam/types";
import { getAuth } from "firebase/auth";
import { billingActions } from "store/features/billing/slice";
import { getBillingTeamMembersProfile } from "..";
import Logger from "lib/logger";
import { getDomainFromEmail } from "utils/FormattingHelper";

let unsubscribeBillingTeamsListener: () => void = null;

export const useBillingTeamsListener = () => {
  const dispatch = useDispatch();

  const user = useSelector(getUserAuthDetails);

  const fetchAndDispatchBillingTeamMembersProfile = useCallback(
    async (billingId: string) => {
      await refreshUserToken();
      getBillingTeamMembersProfile(billingId).then((billingTeamMembers) => {
        if (billingTeamMembers) {
          dispatch(billingActions.setBillingTeamMembers({ billingId, billingTeamMembers }));
        }
      });
    },
    [dispatch]
  );

  const attachBillingTeamsListener = useCallback(() => {
    if (!user.loggedIn) {
      return;
    }
    const domain = getDomainFromEmail(user?.details?.profile?.email);
    const db = getFirestore(firebaseApp);
    const billingTeamsQuery = query(
      collection(db, "billing"),
      or(where("ownerDomain", "==", domain), where(`members.${user?.details?.profile?.uid}`, "!=", null))
    );

    unsubscribeBillingTeamsListener = onSnapshot(billingTeamsQuery, (billingTeams) => {
      const billingTeamDetails = billingTeams.docs.map((billingTeam) => {
        return {
          ...(billingTeam.data() as BillingTeamDetails),
          id: billingTeam.id,
        };
      });
      dispatch(billingActions.setAvailableBillingTeams(billingTeamDetails));
      Promise.all(
        billingTeamDetails.map((billingTeam) => {
          return fetchAndDispatchBillingTeamMembersProfile(billingTeam.id);
        })
      ).then(() => {
        dispatch(billingActions.setBillingTeamsLoading(false));
      });
    });
  }, [
    dispatch,
    fetchAndDispatchBillingTeamMembersProfile,
    user.loggedIn,
    user?.details?.profile?.email,
    user?.details?.profile?.uid,
  ]);

  const refreshUserToken = async () => {
    return getAuth(firebaseApp)
      .currentUser?.getIdTokenResult(true)
      .then(() => {
        Logger.log("token refreshed for billing team custom claim");
      });
  };

  useEffect(() => {
    if (!user.loggedIn) {
      unsubscribeBillingTeamsListener?.();
      dispatch(billingActions.resetState());
    } else {
      refreshUserToken();
    }
  }, [dispatch, user.loggedIn]);

  useEffect(() => {
    unsubscribeBillingTeamsListener?.();
    attachBillingTeamsListener();
  }, [attachBillingTeamsListener]);
};
