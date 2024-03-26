import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import { useSelector } from "react-redux";
import APP_CONSTANTS from "config/constants";
import { getUserAuthDetails } from "store/selectors";
import { PRICING } from "features/pricing";
import { UserPlanDetails } from "../UserPlanDetails";

export const BillingList = () => {
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const [showUserPlanDetails, setShowUserPlanDetails] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setShowUserPlanDetails(false);
    if (location.pathname === APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE) {
      if (billingTeams.length) {
        // navigate to the billing team in which the user is a member
        const team = billingTeams.find((team) => {
          return user?.details?.profile?.uid in team.members;
        });
        if (team?.id && user?.details?.planDetails?.type === PRICING.CHECKOUT.MODES.TEAM)
          navigate(`${APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE}/${team.id}`);
        else {
          // Show user plan details if the user is not a member of any billing team
          setShowUserPlanDetails(true);
          navigate(APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE);
        }
      } else {
        // Show user plan details if the user is not a member of any billing team
        setShowUserPlanDetails(true);
        navigate(APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE);
      }
    }
  }, [location.pathname, billingTeams, navigate, user?.details?.profile?.uid, user?.details?.planDetails?.type]);

  if (showUserPlanDetails) return <UserPlanDetails />;
};
