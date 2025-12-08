import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getIsPlanExpiredBannerClosed } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { RQButton } from "lib/design-system-v2/components";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { globalActions } from "store/slices/global/slice";
import { getPlanNameFromId } from "utils/PremiumUtils";
import { getPrettyPlanName } from "utils/FormattingHelper";
import APP_CONSTANTS from "config/constants";
import { SOURCE } from "modules/analytics/events/common/constants";
import { RiErrorWarningLine } from "@react-icons/all-files/ri/RiErrorWarningLine";
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
        <RiErrorWarningLine size={24} />
        <span className="text-white text-bold mr-8">
          Your {getPrettyPlanName(getPlanNameFromId(user?.details?.planDetails?.planId))} plan has expired. Renew now
          for continued full access.
        </span>
        <RQButton
          type="danger"
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

        <RQButton
          type="transparent"
          className="plan-expired-banner-close-btn"
          icon={<IoMdClose />}
          onClick={() => {
            setIsBannerVisible(false);
            dispatch(globalActions.updatePlanExpiredBannerClosed(true));
          }}
        />
      </div>
    );
  }

  return null;
};
