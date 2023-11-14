import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { getPrettyPlanName } from "utils/FormattingHelper";
import Logger from "lib/logger";
import { Tooltip } from "antd";
import { RQButton } from "lib/design-system/components";
import { httpsCallable, getFunctions } from "firebase/functions";
import { redirectToUrl } from "utils/RedirectionUtils";
import { toast } from "utils/Toast";
import "./premiumPlanBadge.scss";

const PremiumPlanBadge = () => {
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector(getUserAuthDetails);
  const userPlanDetails = user?.details?.planDetails;
  const planId = userPlanDetails?.planId;
  const planStatus = userPlanDetails?.status;
  const planName = getPrettyPlanName(planId);
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

  const handleManageSubscription = useCallback(() => {
    setIsLoading(true);
    const manageSubscription = httpsCallable(getFunctions(), "subscription-manageSubscription");
    manageSubscription({})
      .then((res: any) => {
        if (res?.data?.success) {
          redirectToUrl(res?.data?.data?.portalUrl);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error("Error in managing subscription. Please contact support contact@requestly.io");
        setIsLoading(false);
      });
  }, []);

  if (planId && planStatus === "trialing") {
    return (
      <Tooltip
        overlayInnerStyle={{ padding: "16px 10px" }}
        title={
          <RQButton disabled={isLoading} type="primary" onClick={handleManageSubscription}>
            Manage subscription
          </RQButton>
        }
        placement="bottom"
        color="var(--black)"
      >
        <div className="premium-plan-badge-container cursor-pointer">
          <div className="premium-plan-name">{planName.toUpperCase()}</div>
          <div className="premium-plan-days-left">
            {daysLeft >= 0 ? `${daysLeft} days left in trial` : "Trial Expired"}
          </div>
        </div>
      </Tooltip>
    );
  }

  return null;
};

export default PremiumPlanBadge;
