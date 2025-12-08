import { useCallback, useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import Logger from "lib/logger";
import { globalActions } from "store/slices/global/slice";
import firebaseApp from "../../../../firebase";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import APP_CONSTANTS from "config/constants";
import { SOURCE } from "modules/analytics/events/common/constants";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";
import { getPrettyPlanName } from "utils/FormattingHelper";
import { PRICING } from "features/pricing";
import { GrDiamond } from "@react-icons/all-files/gr/GrDiamond";
import { FiGift } from "@react-icons/all-files/fi/FiGift";
import { MdOutlineWarningAmber } from "@react-icons/all-files/md/MdOutlineWarningAmber";
import UpgradePlanBadge from "./UpgradePlanBadge";

const PremiumPlanBadge = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const [isAppSumoDeal, setIsAppSumoDeal] = useState(false);

  const userPlanDetails = user?.details?.planDetails;
  const planStatus = userPlanDetails?.status ?? "";
  const planEndDateString = userPlanDetails?.subscription?.endDate ?? "";
  const planName = userPlanDetails?.planName ?? PRICING.PLAN_NAMES.FREE;
  const prettyPlanName = planName === PRICING.PLAN_NAMES.PROFESSIONAL ? "Pro" : getPrettyPlanName(planName);
  const isUserLoggedIn = user?.loggedIn ?? false;
  const daysLeft = useMemo(() => {
    const endMs = Date.parse(planEndDateString);
    if (!Number.isFinite(endMs)) return 0;

    const days = Math.ceil((endMs - Date.now()) / (1000 * 60 * 60 * 24));
    return Number.isFinite(days) ? days : 0;
  }, [planEndDateString]);

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

  if (
    isAppSumoDeal ||
    [APP_CONSTANTS.SUBSCRIPTION_STATUS.TRIALING, APP_CONSTANTS.SUBSCRIPTION_STATUS.CANCELLED].includes(planStatus) ||
    daysLeft > 30 ||
    !isUserLoggedIn
  ) {
    return null;
  }

  switch (planName) {
    case PRICING.PLAN_NAMES.FREE:
    case PRICING.PLAN_NAMES.SESSION_FREE:
    case PRICING.PLAN_NAMES.BRONZE:
      // User is on free plan
      return (
        <UpgradePlanBadge
          icon={<FiGift size={16} />}
          planStatusInfo="Free plan"
          handleBadgeClick={handleBadgeClick}
          badgeText="Upgrade"
        />
      );

    default:
      // Plan end date has been exceeded
      if (daysLeft <= 0) {
        return (
          <UpgradePlanBadge
            icon={<MdOutlineWarningAmber size={16} />}
            planStatusInfo="Plan expired"
            handleBadgeClick={handleBadgeClick}
            badgeText="Renew now"
            containerClassName="expired-plan"
          />
        );
      }

      // Plan is about to expire
      return (
        <UpgradePlanBadge
          icon={<GrDiamond size={16} />}
          planStatusInfo={
            daysLeft === 1
              ? `${prettyPlanName} plan: ${daysLeft} day left`
              : `${prettyPlanName} plan: ${daysLeft} days left`
          }
          handleBadgeClick={handleBadgeClick}
          badgeText="Upgrade"
        />
      );
  }
};

export default PremiumPlanBadge;
