import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import { useSelector } from "react-redux";
import APP_CONSTANTS from "config/constants";
import { getUserAuthDetails } from "store/slices/global/user/selectors";

export const BillingList: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);

  useEffect(() => {
    const userId = user?.details?.profile?.uid;
    const activeBillingTeam = billingTeams.find(
      (team) => userId in team.members && team.subscriptionDetails?.subscriptionStatus === "active"
    );

    if (activeBillingTeam) {
      navigate(`${APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE}/${activeBillingTeam.id}`);
    } else if (billingTeams.length) {
      // Case when user is not part of any billing team but there are other teams or teams with non-active subscriptions are present
      navigate(`${APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE}/${billingTeams[0].id}`);
    } else {
      navigate(APP_CONSTANTS.PATHS.SETTINGS.MY_PLAN.RELATIVE);
    }
  }, [billingTeams, navigate, user?.details?.planDetails?.type, user?.details?.profile?.uid]);

  return null;
};
