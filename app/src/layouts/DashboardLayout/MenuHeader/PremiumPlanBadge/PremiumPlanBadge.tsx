import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { getPlanNameFromId } from "utils/PremiumUtils";
import Logger from "lib/logger";
import "./premiumPlanBadge.scss";
import { actions } from "store";
import { Tooltip } from "antd";

const PremiumPlanBadge = () => {
  const dispatch = useDispatch();

  const user = useSelector(getUserAuthDetails);
  const userPlanDetails = user?.details?.planDetails;
  const planId = userPlanDetails?.planId;
  const planStatus = userPlanDetails?.status;
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

  if (planId && planStatus !== "active") {
    return (
      <Tooltip title={"Click for more details"} destroyTooltipOnHide={true}>
        <div
          className="premium-plan-badge-container cursor-pointer"
          onClick={() => {
            dispatch(
              actions.toggleActiveModal({
                modalName: "pricingModal",
                newValue: true,
                newProps: { selectedPlan: null, source: "trial_badge" },
              })
            );
          }}
        >
          <div className="premium-plan-name">{getPlanNameFromId(planId).toUpperCase()}</div>
          <div className="premium-plan-days-left">
            {planStatus === "trialing" ? `${daysLeft} days left in trial` : "Plan Expired"}
          </div>
        </div>
      </Tooltip>
    );
  }

  return null;
};

export default PremiumPlanBadge;
