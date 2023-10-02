import { getAuth } from "firebase/auth";
import { onValue } from "firebase/database";
import { getNodeRef } from "../../actions/FirebaseActions";
import APP_CONSTANTS from "../../config/constants";
import firebaseApp from "../../firebase";
import { actions } from "../../store";
import { submitAttrUtil } from "../../utils/AnalyticsUtils";
import { getPlanName, isPremiumUser } from "../../utils/PremiumUtils";

const TRACKING = APP_CONSTANTS.GA_EVENTS;

const userSubscriptionNodeListener = (dispatch, isUserLoggedIn) => {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;

  if (user) {
    try {
      const userSubscriptionNodeRef = getNodeRef(["userSubscriptions", user.uid, "planDetails"]);
      onValue(userSubscriptionNodeRef, async (snapshot) => {
        const planDetails = snapshot.val();
        const isUserPremium = isPremiumUser(planDetails);

        dispatch(
          actions.updateUserPlanDetails({
            userPlanDetails: {
              ...planDetails,
              planName: isUserPremium ? getPlanName(planDetails) : APP_CONSTANTS.PRICING.PLAN_NAMES.FREE,
            },
            isUserPremium,
          })
        );
        submitAttrUtil(TRACKING.ATTR.IS_PREMIUM, isUserPremium);
        if (planDetails) {
          submitAttrUtil(TRACKING.ATTR.PAYMENT_MODE, planDetails.type || "Missing Value");
          submitAttrUtil(TRACKING.ATTR.PLAN_ID, planDetails.planId || "Missing Value");

          if (planDetails.subscription) {
            submitAttrUtil(TRACKING.ATTR.PLAN_START_DATE, planDetails.subscription.startDate || "Missing Value");
            submitAttrUtil(TRACKING.ATTR.PLAN_END_DATE, planDetails.subscription.endDate || "Missing Value");
          }
        }
      });
    } catch (e) {
      dispatch(
        actions.updateUserPlanDetails({
          userPlanDetails: null,
          isUserPremium: false,
        })
      );
    }
  }
  if (!isUserLoggedIn) {
    dispatch(
      actions.updateUserPlanDetails({
        userPlanDetails: null,
        isUserPremium: false,
      })
    );
  }
};

export default userSubscriptionNodeListener;
