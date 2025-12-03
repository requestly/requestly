import { useCallback, useEffect } from "react";
import firebaseApp from "../../../firebase";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { collection, getDocs, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import { BillingTeamDetails } from "features/settings/components/BillingTeam/types";
import { getAuth } from "firebase/auth";
import { billingActions } from "store/features/billing/slice";
import { getBillingTeamMembersProfile } from "..";
import Logger from "lib/logger";
import { getDomainFromEmail } from "utils/FormattingHelper";
import { isCompanyEmail } from "utils/mailCheckerUtils";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import APP_CONSTANTS from "config/constants";

const TRACKING = APP_CONSTANTS.GA_EVENTS;

let unsubscribeBillingTeamsListener: () => void;

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
      where(`members.${user?.details?.profile?.uid}`, "!=", null)
    );

    unsubscribeBillingTeamsListener = onSnapshot(billingTeamsQuery, async (billingTeams) => {
      const userBillingTeamIds = new Set();
      const billingTeamDetails = billingTeams.docs.map((billingTeam) => {
        userBillingTeamIds.add(billingTeam.id);
        return {
          ...(billingTeam.data() as BillingTeamDetails),
          id: billingTeam.id,
        };
      });

      if (user.details?.emailType && isCompanyEmail(user.details.emailType)) {
        const domainBillingTeamsQuery = query(
          collection(db, "billing"),
          where("ownerDomains", "array-contains", domain)
        );
        await getDocs(domainBillingTeamsQuery)
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              if (!userBillingTeamIds.has(doc.id)) {
                const billingTeam = {
                  ...(doc.data() as BillingTeamDetails),
                  id: doc.id,
                };
                if (billingTeam.isAcceleratorTeam === true) {
                  submitAttrUtil(TRACKING.ATTR.IS_ACCELERATOR_AVAILABLE, true);
                }
                billingTeamDetails.push(billingTeam);
              }
            });
          })
          .catch((error) => {
            Logger.error("Error getting domain billing teams: ", error);
          });
      }

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
    user.loggedIn,
    user.details?.profile?.email,
    user.details?.profile?.uid,
    user.details?.emailType,
    dispatch,
    fetchAndDispatchBillingTeamMembersProfile,
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
