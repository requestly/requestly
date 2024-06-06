import { useState } from "react";
import { getIsMiscTourCompleted, getUserAuthDetails } from "store/selectors";
import { useDispatch, useSelector } from "react-redux";
import { FiGift } from "@react-icons/all-files/fi/FiGift";
import { Badge } from "antd";
import { IncentiveTasksListModal } from "features/incentivization";
import { RQButton } from "lib/design-system/components";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import { ProductWalkthrough } from "components/misc/ProductWalkthrough";
import { MISC_TOURS, TOUR_TYPES } from "components/misc/ProductWalkthrough/constants";
import "./creditsButton.scss";

export const CreditsButton = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const isMiscTourCompleted = useSelector(getIsMiscTourCompleted);
  const [isTaskListModalVisible, setIsTaskListModalVisible] = useState(false);

  const handleButtonClick = () => {
    if (user.loggedIn) {
      setIsTaskListModalVisible(true);
      if (!isMiscTourCompleted.earnCredits) {
        dispatch(
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
  return (
    <>
      <ProductWalkthrough
        completeTourOnUnmount={false}
        tourFor={MISC_TOURS.APP_ENGAGEMENT.EARN_CREDITS}
        // TODO: ADD CONDITION TO ONLY START WALKTHROUGH FOR NEW USERS ONLY
        startWalkthrough={!isMiscTourCompleted.earnCredits}
        onTourComplete={() =>
          dispatch(
            actions.updateProductTourCompleted({
              tour: TOUR_TYPES.MISCELLANEOUS,
              // TODO: IMPROVE WALKTHROUGH COMPONENT, SUBTOUR SHOULD BE PASSED AS A CONSTANT
              subTour: "earnCredits",
            })
          )
        }
      />
      <RQButton
        className="primary-sidebar-link w-full"
        onClick={handleButtonClick}
        data-tour-id={MISC_TOURS.APP_ENGAGEMENT.EARN_CREDITS}
      >
        <div className="icon__wrapper">
          {!isMiscTourCompleted.earnCredits ? (
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
              // TODO: Replace with actual credits earned
              status="default"
              count={<span className="credits-earned-count">$100</span>}
            >
              <FiGift />
            </Badge>
          )}
        </div>
        <div className="link-title">Credits</div>
      </RQButton>
      <IncentiveTasksListModal isOpen={isTaskListModalVisible} onClose={() => setIsTaskListModalVisible(false)} />
    </>
  );
};
