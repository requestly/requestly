import { useSelector, useDispatch } from "react-redux";
import { getIsPlanExpiredBannerClosed, getUserAuthDetails } from "store/selectors";
import { RQButton } from "lib/design-system/components";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { actions } from "store";
import { getPlanNameFromId } from "utils/PremiumUtils";
import { getPrettyPlanName } from "utils/FormattingHelper";
import "./index.scss";

export const PlanExpiredBanner = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const isPlanExpiredBannerClosed = useSelector(getIsPlanExpiredBannerClosed);

  if (user?.details?.planDetails?.status === "canceled" && !isPlanExpiredBannerClosed) {
    return (
      <div className="plan-expired-banner">
        <span className="plan-expired-banner-badge">PLAN EXPIRED</span>
        <span className="text-white text-bold">
          Your {getPrettyPlanName(getPlanNameFromId(user?.details?.planDetails?.planId))} plan has expired. Renew now to
          get full feature access!
        </span>
        <RQButton
          type="default"
          className="plan-expired-banner-btn"
          onClick={() => {
            dispatch(
              actions.toggleActiveModal({
                modalName: "pricingModal",
                newValue: true,
                newProps: { selectedPlan: null, source: "plan_expired_banner" },
              })
            );
          }}
        >
          Renew now
        </RQButton>

        <IoMdClose
          className="plan-expired-banner-close-btn"
          onClick={() => dispatch(actions.updatePlanExpiredBannerClosed(true))}
        />
      </div>
    );
  }

  return null;
};
