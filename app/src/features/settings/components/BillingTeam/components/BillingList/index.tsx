import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import { useSelector } from "react-redux";
import APP_CONSTANTS from "config/constants";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { UserPlanDetails } from "../UserPlanDetails";

export const BillingList = () => {
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const [showUserPlanDetails, setShowUserPlanDetails] = useState(false);

  useEffect(() => {
    setShowUserPlanDetails(false);

    const planType = user?.details?.planDetails?.type;
    const userId = user?.details?.profile?.uid;
    const team = billingTeams.find((team) => userId in team.members);

    if (team && !["student", "appsumo", "signup_trial"].includes(planType)) {
      navigate(`${APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE}/${team.id}`);
    } else {
      setShowUserPlanDetails(true);
      navigate(APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE);
    }
  }, [billingTeams, navigate, user?.details?.planDetails?.type, user?.details?.profile?.uid]);

  if (showUserPlanDetails)
    return (
      <div className="display-row-center w-full">
        <div className="w-full" style={{ maxWidth: "1000px" }}>
          <UserPlanDetails />
        </div>
      </div>
    );
};
