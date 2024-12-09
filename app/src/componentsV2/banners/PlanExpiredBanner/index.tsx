import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getIsPlanExpiredBannerClosed } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { RQButton } from "lib/design-system/components";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { globalActions } from "store/slices/global/slice";
import { getPlanNameFromId } from "utils/PremiumUtils";
import { getPrettyPlanName } from "utils/FormattingHelper";
import APP_CONSTANTS from "config/constants";
import { SOURCE } from "modules/analytics/events/common/constants";
import "./index.scss";

export const PlanExpiredBanner = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const isPlanExpiredBannerClosed = useSelector(getIsPlanExpiredBannerClosed);
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  useEffect(() => {
    if (
      user?.details?.planDetails?.status === APP_CONSTANTS.SUBSCRIPTION_STATUS.CANCELLED &&
      !isPlanExpiredBannerClosed
    ) {
      setIsBannerVisible(true);
      dispatch(globalActions.updateIsAppBannerVisible(true));
    } else {
      setIsBannerVisible(false);
      dispatch(globalActions.updateIsAppBannerVisible(false));
    }
  }, [user?.details?.planDetails?.status, isPlanExpiredBannerClosed, dispatch]);

  if (isBannerVisible) {
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
              globalActions.toggleActiveModal({
                modalName: "pricingModal",
                newValue: true,
                newProps: { selectedPlan: null, source: SOURCE.PLAN_EXPIRED_BANNER },
              })
            );
          }}
        >
          Renew now
        </RQButton>

        <IoMdClose
          className="plan-expired-banner-close-btn"
          onClick={() => dispatch(globalActions.updatePlanExpiredBannerClosed(true))}
        />
      </div>
    );
  }

  return null;
};
