import firebaseApp from "../../firebase";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import { globalActions } from "store/slices/global/slice";
import { getPlanName, isPremiumUser } from "utils/PremiumUtils";
import Logger from "lib/logger";
import { isSetappBuild } from "../../utils/AppUtils";

export const userSubscriptionDocListener = (dispatch, uid) => {
  if (uid) {
    try {
      const db = getFirestore(firebaseApp);
      const userSubscriptionDocRef = doc(db, "individualSubscriptions", uid);
      onSnapshot(
        userSubscriptionDocRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            const planDetails = newSchemaToOldSchemaAdapter(data);
            const isUserPremium = isPremiumUser(planDetails);

            dispatch(
              globalActions.updateUserPlanDetails({
                userPlanDetails: {
                  ...planDetails,
                  planName: getPlanName(planDetails),
                },
                isUserPremium,
              })
            );
          }
        },
        (err) => {
          Logger.log(`Encountered error: ${err}`);
        }
      );
    } catch (err) {
      dispatch(
        globalActions.updateUserPlanDetails({
          userPlanDetails: null,
          isUserPremium: false,
        })
      );
    }
  } else {
    dispatch(
      globalActions.updateUserPlanDetails({
        userPlanDetails: null,
        isUserPremium: false,
      })
    );
  }
};

const checkIfAnnualPlan = (firestoreData) => {
  const startDate = new Date(firestoreData?.subscriptionCurrentPeriodStart * 1000);
  const renewalDate = new Date(firestoreData?.subscriptionCurrentPeriodEnd * 1000);
  // Calculate the difference in months
  const monthsDiff =
    (renewalDate.getFullYear() - startDate.getFullYear()) * 12 + (renewalDate.getMonth() - startDate.getMonth());
  return monthsDiff > 1;
};

export const preparePlan = (firestoreData) => {
  if (isSetappBuild()) {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 30);

    return {
      planId: "professional",
      status: "active",
      subscription: {
        cancelAtPeriodEnd: false,
        endDate: endDate.toISOString().split("T")[0],
        startDate: today.toISOString().split("T")[0],
        id: "setapp_subscription",
        duration: "monthly",
        quantity: 1,
        billingId: null,
        isBrowserstackSubscription: false,
      },
      type: "setapp",
    };
  }

  if (!firestoreData) {
    return null;
  }
  return newSchemaToOldSchemaAdapter(firestoreData);
};

const newSchemaToOldSchemaAdapter = (firestoreData) => {
  const planDetails = {
    planId: firestoreData?.plan,
    status: firestoreData?.subscriptionStatus,
    subscription: {
      cancelAtPeriodEnd: firestoreData?.cancel_at_period_end || false,
      endDate:
        firestoreData?.subscriptionCurrentPeriodEnd &&
        new Date(firestoreData?.subscriptionCurrentPeriodEnd * 1000).toISOString().split("T")[0],
      startDate:
        firestoreData?.subscriptionCurrentPeriodEnd &&
        new Date(firestoreData?.subscriptionCurrentPeriodStart * 1000).toISOString().split("T")[0],
      id: firestoreData?.stripeActiveSubscriptionID,
      duration: firestoreData?.duration ?? (checkIfAnnualPlan(firestoreData) ? "annually" : "monthly"),
      quantity: firestoreData?.quantity,
      billingId: firestoreData?.billingId,
      isBrowserstackSubscription: firestoreData?.isBrowserstackSubscription ?? false,
    },
    type: firestoreData?.rqSubscriptionType ?? firestoreData?.type, //TODO: type to be deprecated after migration
  };

  return planDetails;
};
