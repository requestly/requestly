import { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getPlanNameFromId } from "utils/PremiumUtils";
import Logger from "lib/logger";
import { globalActions } from "store/slices/global/slice";
import { Tooltip } from "antd";
import { getPrettyPlanName } from "utils/FormattingHelper";
import firebaseApp from "../../../../firebase";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import APP_CONSTANTS from "config/constants";
import { SOURCE } from "modules/analytics/events/common/constants";
import { useIsIncentivizationEnabled } from "features/incentivization/hooks";
import "./premiumPlanBadge.scss";
import { getActiveWorkspaceId } from "features/workspaces/utils";
import { getActiveWorkspaceIds } from "store/slices/workspaces/selectors";

const PremiumPlanBadge = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const activeWorkspaceId = getActiveWorkspaceId(useSelector(getActiveWorkspaceIds));
  const userPlanDetails = user?.details?.planDetails;
  const planId = userPlanDetails?.planId;
  const planStatus = userPlanDetails?.status;
  const planEndDateString = userPlanDetails?.subscription?.endDate;
  const [isAppSumoDeal, setIsAppSumoDeal] = useState(false);
  const isIncentivizationEnabled = useIsIncentivizationEnabled();

  let daysLeft = 0;

  const handleBadgeClick = useCallback(() => {
    dispatch(
      globalActions.toggleActiveModal({
        modalName: "pricingModal",
        newValue: true,
        newProps: {
          selectedPlan: null,
          source:
            planStatus === APP_CONSTANTS.SUBSCRIPTION_STATUS.TRIALING
              ? SOURCE.TRIAL_ONGOING_BADGE
              : SOURCE.TRIAL_EXPIRED_BADGE,
        },
      })
    );
  }, [dispatch, planStatus]);

  useEffect(() => {
    if (!activeWorkspaceId) return;

    const db = getFirestore(firebaseApp);
    const teamsRef = doc(db, "teams", activeWorkspaceId);

    getDoc(teamsRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data?.appsumo) {
            setIsAppSumoDeal(true);
          }
        }
      })
      .catch(() => {
        Logger.log("Error while fetching appsumo details for team");
      });
  }, [activeWorkspaceId]);

  try {
    const planEndDate = new Date(planEndDateString);
    const currentDate = new Date();
    // @ts-ignore
    let diffTime: any = planEndDate - currentDate;
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (err) {
    Logger.log(err);
  }

  if (
    !isAppSumoDeal &&
    planId &&
    [APP_CONSTANTS.SUBSCRIPTION_STATUS.TRIALING, APP_CONSTANTS.SUBSCRIPTION_STATUS.CANCELLED].includes(planStatus)
  ) {
    return (
      <Tooltip title={"Click for more details"} destroyTooltipOnHide={true}>
        <div
          className="premium-plan-badge-container cursor-pointer"
          role="button"
          onKeyDown={handleBadgeClick}
          onClick={handleBadgeClick}
        >
          <div className="premium-plan-name">{getPrettyPlanName(getPlanNameFromId(planId))}</div>
          <div className="premium-plan-days-left">
            {planStatus === APP_CONSTANTS.SUBSCRIPTION_STATUS.TRIALING
              ? `${daysLeft} days left in  ${isIncentivizationEnabled ? "plan" : "trial"}`
              : "Plan Expired"}
          </div>
        </div>
      </Tooltip>
    );
  }

  return null;
};

export default PremiumPlanBadge;
