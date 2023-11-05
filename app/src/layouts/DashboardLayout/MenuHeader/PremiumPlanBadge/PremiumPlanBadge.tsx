import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { getPrettyPlanName } from "utils/FormattingHelper";
import "./premiumPlanBadge.scss";
import Logger from "lib/logger";

const PremiumPlanBadge = () => {
  const user = useSelector(getUserAuthDetails);

  const userPlanDetails = user?.details?.planDetails;
  const planId = userPlanDetails?.planId;
  const planStatus = userPlanDetails?.status;
  const planName = getPrettyPlanName(planId);
  const planEndDateString = userPlanDetails?.subscription?.endDate;
  let daysLeft = 0;

  console.log(userPlanDetails);

  try {
    const planEndDate = new Date(planEndDateString);
    const currentDate = new Date();
    // @ts-ignore
    const diffTime: any = Math.abs(planEndDate - currentDate);
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (err) {
    Logger.log(err);
  }

  if (planId && planStatus === "trialing") {
    return (
      <div className="premium-plan-badge-container">
        <div className="premium-plan-name">{planName.toUpperCase()}</div>
        <div className="premium-plan-days-left">{daysLeft} days left in trial</div>
      </div>
    );
  }

  return null;
};

export default PremiumPlanBadge;
