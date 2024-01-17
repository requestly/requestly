import { useCallback, useEffect } from "react";
import firebaseApp from "../../../firebase";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import { BillingTeamDetails } from "features/settings/components/BillingTeam/types";
import { getAuth } from "firebase/auth";
import { billingActions } from "store/features/billing/slice";

let unsubscribeBillingTeamsListener: () => void = null;

export const useBillingTeamsListener = () => {
  const dispatch = useDispatch();

  const user = useSelector(getUserAuthDetails);

  const attachBillingTeamsListener = useCallback(() => {
    if (!user.loggedIn) {
      return;
    }

    const db = getFirestore(firebaseApp);
    const billingTeamsQuery = query(
      collection(db, "billing"),
      where(`members.${user.details.profile.uid}`, "!=", null)
    );

    unsubscribeBillingTeamsListener = onSnapshot(billingTeamsQuery, (billingTeams) => {
      const billingTeamDetails = billingTeams.docs.map((billingTeam) => {
        return {
          ...(billingTeam.data() as BillingTeamDetails),
          id: billingTeam.id,
        };
      });
      dispatch(billingActions.setAvailableBillingTeams(billingTeamDetails));
    });
  }, [dispatch, user.details.profile.uid, user.loggedIn]);

  useEffect(() => {
    getAuth(firebaseApp)
      .currentUser?.getIdTokenResult(true)
      .then(() => {
        console.log("!!!debug", "toke refreshed");
      });
  }, [user.loggedIn]);

  useEffect(() => {
    unsubscribeBillingTeamsListener?.();
    attachBillingTeamsListener();
  }, [attachBillingTeamsListener]);
};
