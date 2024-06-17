import { useEffect, useState } from "react";
import { getIsMiscTourCompleted } from "store/selectors";
import { useDispatch, useSelector } from "react-redux";
import { FiGift } from "@react-icons/all-files/fi/FiGift";
import { Badge } from "antd";
import { RQButton } from "lib/design-system/components";
import { actions } from "store";
import { ProductWalkthrough } from "components/misc/ProductWalkthrough";
import { MISC_TOURS, TOUR_TYPES } from "components/misc/ProductWalkthrough/constants";
import { getUserIncentivizationDetails } from "store/features/incentivization/selectors";
import { INCENTIVIZATION_SOURCE } from "features/incentivization";
import { trackSidebarClicked } from "modules/analytics/events/common/onboarding/sidebar";
import { IncentivizationModal } from "store/features/incentivization/types";
import { incentivizationActions } from "store/features/incentivization/slice";
import "./creditsButton.scss";

export const CreditsButton = () => {
  const dispatch = useDispatch();
  const isMiscTourCompleted = useSelector(getIsMiscTourCompleted);
  const userMilestoneAndRewardDetails = useSelector(getUserIncentivizationDetails);
  const [isCreditsTourVisible, setIsCreditsTourVisible] = useState(false);

  const handleCreditsClick = () => {
    trackSidebarClicked("credits");

    dispatch(
      incentivizationActions.toggleActiveModal({
        modalName: IncentivizationModal.TASKS_LIST_MODAL,
        newValue: true,
        newProps: {
          source: INCENTIVIZATION_SOURCE.SIDEBAR,
        },
      })
    );

    if (!isMiscTourCompleted.earnCredits) {
      setIsCreditsTourVisible(false);
      dispatch(
        // @ts-ignore
        actions.updateProductTourCompleted({
          tour: TOUR_TYPES.MISCELLANEOUS,
          subTour: "earnCredits",
        })
      );
    }
  };

  useEffect(() => {
    // TODO: ADD CONDITION TO ONLY START WALKTHROUGH FOR NEW USERS ONLY
    if (!isMiscTourCompleted.earnCredits) {
      setIsCreditsTourVisible(true);
    }
  }, [isMiscTourCompleted.earnCredits]);

  return (
    <>
      <ProductWalkthrough
        completeTourOnUnmount={false}
        tourFor={MISC_TOURS.APP_ENGAGEMENT.EARN_CREDITS}
        startWalkthrough={isCreditsTourVisible}
        onTourComplete={() => {
          setIsCreditsTourVisible(false);
          dispatch(
            // @ts-ignore
            actions.updateProductTourCompleted({
              tour: TOUR_TYPES.MISCELLANEOUS,
              // TODO: IMPROVE WALKTHROUGH COMPONENT, SUBTOUR SHOULD BE PASSED AS A CONSTANT
              subTour: "earnCredits",
            })
          );
        }}
      />
      <RQButton
        className="primary-sidebar-link w-full"
        onClick={handleCreditsClick}
        data-tour-id={MISC_TOURS.APP_ENGAGEMENT.EARN_CREDITS}
      >
        <div className="icon__wrapper">
          {isCreditsTourVisible ? (
            <Badge
              className="credits-earned-badge"
              size="small"
              status="default"
              count={<span className="earn-credits-nudge-dot"></span>}
            >
              <FiGift />
            </Badge>
          ) : (
            <Badge
              className="credits-earned-badge"
              size="small"
              status="default"
              count={
                (userMilestoneAndRewardDetails?.totalCreditsClaimed ?? 0) > 0 ? (
                  <span className="credits-earned-count">
                    ${userMilestoneAndRewardDetails?.totalCreditsClaimed ?? 0}
                  </span>
                ) : (
                  0
                )
              }
            >
              <FiGift />
            </Badge>
          )}
        </div>
        <div className="link-title">Credits</div>
      </RQButton>
    </>
  );
};
