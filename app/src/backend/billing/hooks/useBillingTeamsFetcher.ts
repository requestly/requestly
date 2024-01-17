import { useCallback, useEffect, useState } from "react";
import firebaseApp from "../../../firebase";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import { BillingTeamDetails } from "features/settings/components/BillingTeam/types";

let unsubscribeBillingTeamsListener: () => void = null;

export const useBillingTeamsListener = () => {
  const user = useSelector(getUserAuthDetails);

  const [billingTeams, setBillingTeams] = useState([]);

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
      setBillingTeams(billingTeamDetails);
    });
  }, [user?.details?.profile?.uid, user.loggedIn]);

  useEffect(() => {
    unsubscribeBillingTeamsListener?.();
    attachBillingTeamsListener();
  }, [attachBillingTeamsListener]);

  return billingTeams;
};
