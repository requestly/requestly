import { useSelector, useDispatch } from "react-redux";
import { getIsPlanExpiredBannerClosed, getUserAuthDetails } from "store/selectors";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { RQButton } from "lib/design-system/components";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { actions } from "store";
import { getPlanNameFromId } from "utils/PremiumUtils";
import { capitalize } from "lodash";
import "./index.scss";

export const PlanExpiredBanner = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const isPlanExpiredBannerClosed = useSelector(getIsPlanExpiredBannerClosed);
  const paywallIntensityExp = useFeatureValue("paywall_intensity", null);

  if (
    paywallIntensityExp !== "control" &&
    user?.details?.planDetails?.status === "canceled" &&
    !isPlanExpiredBannerClosed
  ) {
    return (
      <div className="plan-expired-banner">
        <span className="plan-expired-banner-badge">PLAN EXPIRED</span>
        <span className="text-white text-bold">
          Your {capitalize(getPlanNameFromId(user?.details?.planDetails?.planId))} plan has expired. Renew now to get
          full feature access!
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
