import { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import Logger from "lib/logger";
import { globalActions } from "store/slices/global/slice";
import { Tooltip } from "antd";
import firebaseApp from "../../../../firebase";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import APP_CONSTANTS from "config/constants";
import { SOURCE } from "modules/analytics/events/common/constants";
import "./premiumPlanBadge.scss";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";
import { getPrettyPlanName } from "utils/FormattingHelper";

const PremiumPlanBadge = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const userPlanDetails = user?.details?.planDetails;
  const planId = userPlanDetails?.planId;
  const planStatus = userPlanDetails?.status;
  const planEndDateString = userPlanDetails?.subscription?.endDate ?? 0;
  const [isAppSumoDeal, setIsAppSumoDeal] = useState(false);

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
    [APP_CONSTANTS.SUBSCRIPTION_STATUS.TRIALING, APP_CONSTANTS.SUBSCRIPTION_STATUS.CANCELLED].includes(planStatus ?? "")
  ) {
    if (daysLeft > 30) {
      return null;
    }

    const planName =
      userPlanDetails?.planName === "professional" ? "Pro" : getPrettyPlanName(userPlanDetails?.planName);

    return (
      <Tooltip title={"Click for more details"} destroyTooltipOnHide={true}>
        <div
          className="premium-plan-badge-container cursor-pointer"
          role="button"
          onKeyDown={handleBadgeClick}
          onClick={handleBadgeClick}
        >
          <div className="premium-plan-name">{`${planName} (Trial)`}</div>
          <div className="premium-plan-days-left">
            {planStatus === APP_CONSTANTS.SUBSCRIPTION_STATUS.TRIALING ? `${daysLeft}d left` : "Expired"}
          </div>
        </div>
      </Tooltip>
    );
  }

  return null;
};

export default PremiumPlanBadge;
