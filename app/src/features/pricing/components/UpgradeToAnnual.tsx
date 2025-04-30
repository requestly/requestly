import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Result } from "antd";
import PageLoader from "components/misc/PageLoader";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getFunctions, httpsCallable } from "firebase/functions";
import { globalActions } from "store/slices/global/slice";
import APP_CONSTANTS from "config/constants";
import {
  trackCheckoutFailedEvent,
  trackCheckoutInitiated,
  trackUpgradeToAnnualRouteOpened,
} from "modules/analytics/events/misc/business/checkout";
import { toast } from "utils/Toast";
import { PlanStatus, PlanType } from "features/settings/components/BillingTeam/types";
import { PRICING } from "../constants/pricing";
import { getAvailableBillingTeams } from "store/features/billing/selectors";

export const UpgradeToAnnual: React.FC = () => {
  const dispatch = useDispatch();
  const firebaseFunction = getFunctions();

  const user = useSelector(getUserAuthDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);

  const [pageMessage, setPageMessage] = useState("Please wait, redirecting to stripe...");
  const [showLoader, setShowLoader] = useState(true);

  const switchPlanToAnnual = useCallback(() => {
    const manageSubscription = httpsCallable(firebaseFunction, "subscription-manageSubscription");
    manageSubscription({
      planName: user?.details?.planDetails?.planName,
      duration: "annually",
      portalFlowType: "update_subscription",
      monthlyConversionToAnnual: true,
    })
      .then((res: any) => {
        if (res?.data?.success) {
          window.location.href = res?.data?.data?.portalUrl;
          trackUpgradeToAnnualRouteOpened({
            plan_name: user?.details?.planDetails?.planName,
            quantity: user?.details?.planDetails?.subscription?.quantity,
          });
          trackCheckoutInitiated({
            plan_name: user?.details?.planDetails?.planName,
            duration: "annually",
            currency: "usd",
            quantity: user?.details?.planDetails?.subscription?.quantity,
            source: "monthly_to_annual_conversion",
          });
        }
      })
      .catch(() => {
        toast.error("Error in converting to annual plan. Please contact support contact@requestly.io");
        trackCheckoutFailedEvent(
          user?.details?.planDetails?.subscription?.quantity,
          "monthly_to_annual_conversion",
          "requestly"
        );
      });
  }, [firebaseFunction, user?.details?.planDetails?.planName, user?.details?.planDetails?.subscription?.quantity]);

  useEffect(() => {
    if (!user.loggedIn) {
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            eventSource: "upgrade_to_annual",
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
            warningMessage: `Please sign in to switch to annual plan!`,
            closable: false,
          },
        })
      );
    } else if (!user?.details?.isPremium || user?.details?.planDetails?.status !== PlanStatus.ACTIVE) {
      setPageMessage("You do not have a premium plan to upgrade. Please contact support at contact@requestly.io");
      setShowLoader(false);
    } else if (user?.details?.planDetails?.subscription?.duration === PRICING.DURATION.ANNUALLY) {
      setPageMessage("You are already on an annual plan.");
      setShowLoader(false);
    } else if (user?.details?.planDetails?.type === PlanType.INDIVIDUAL) {
      switchPlanToAnnual();
    } else {
      const isTeamOwner = billingTeams?.some(
        (team) =>
          user?.details?.profile?.uid in team.members &&
          !team.isAcceleratorTeam &&
          team.owner === user?.details?.profile?.uid
      );

      if (isTeamOwner) {
        switchPlanToAnnual();
        setPageMessage("Please wait, redirecting to stripe...");
        setShowLoader(true);
      } else {
        setPageMessage(
          "You are not the manager of billing team. Please contact your billing team manager or our support at contact@requestly.io"
        );
        setShowLoader(false);
      }
    }
  }, [
    billingTeams,
    dispatch,
    switchPlanToAnnual,
    user?.details?.isPremium,
    user?.details?.planDetails?.status,
    user?.details?.planDetails?.subscription?.duration,
    user?.details?.planDetails?.type,
    user?.details?.profile?.uid,
    user.loggedIn,
  ]);

  return <Result title={pageMessage} extra={[showLoader && <PageLoader message="" />]} />;
};
