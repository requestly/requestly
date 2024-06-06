import { useEffect, useState } from "react";
import { getIsMiscTourCompleted, getUserAuthDetails } from "store/selectors";
import { useDispatch, useSelector } from "react-redux";
import { FiGift } from "@react-icons/all-files/fi/FiGift";
import { Badge } from "antd";
import { RQButton } from "lib/design-system/components";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import { ProductWalkthrough } from "components/misc/ProductWalkthrough";
import { MISC_TOURS, TOUR_TYPES } from "components/misc/ProductWalkthrough/constants";
import { getIncentivizationUserMilestoneDetails } from "store/features/incentivization/selectors";
import "./creditsButton.scss";

export const CreditsButton = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const isMiscTourCompleted = useSelector(getIsMiscTourCompleted);
  const userMilestoneDetails = useSelector(getIncentivizationUserMilestoneDetails);
  const [isCreditsTourVisible, setIsCreditsTourVisible] = useState(false);

  const handleButtonClick = () => {
    if (user?.loggedIn) {
      // @ts-ignore
      dispatch(actions.toggleActiveModal({ modalName: "incentiveTasksListModal", newValue: true }));

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
    } else {
      dispatch(
        // @ts-ignore
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
            warningMessage: "You must sign in to earn or redeem free credits.",
          },
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
        onClick={handleButtonClick}
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
                (userMilestoneDetails?.totalCreditsClaimed ?? 0) > 0 ? (
                  <span className="credits-earned-count">${userMilestoneDetails?.totalCreditsClaimed ?? 0}</span>
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
