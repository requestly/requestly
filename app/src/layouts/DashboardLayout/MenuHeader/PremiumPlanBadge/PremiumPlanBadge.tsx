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
  const planName = getPrettyPlanName(userPlanDetails?.planName);
  const planEndDateString = userPlanDetails?.subscription?.endDate;
  let daysLeft = 0;

  try {
    const planEndDate = new Date(planEndDateString);
    const currentDate = new Date();
    // @ts-ignore
    let diffTime: any = planEndDate - currentDate;
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (err) {
    Logger.log(err);
  }

  if (planId && planStatus === "trialing") {
    return (
      <div className="premium-plan-badge-container">
        <div className="premium-plan-name">{planName.toUpperCase()}</div>
        <div className="premium-plan-days-left">
          {daysLeft >= 0 ? `${daysLeft} days left in trial` : "Trial Expired"}
        </div>
      </div>
    );
  }

  return null;
};

export default PremiumPlanBadge;
