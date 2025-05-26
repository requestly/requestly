import { useDispatch, useSelector } from "react-redux";
import { FiGift } from "@react-icons/all-files/fi/FiGift";
import { Badge } from "antd";
import { RQButton } from "lib/design-system/components";
import { getUserIncentivizationDetails } from "store/features/incentivization/selectors";
import { INCENTIVIZATION_SOURCE } from "features/incentivization";
import { IncentivizationModal } from "store/features/incentivization/types";
import { incentivizationActions } from "store/features/incentivization/slice";
import "./creditsButton.scss";

export const CreditsButton = () => {
  const dispatch = useDispatch();
  const userMilestoneAndRewardDetails = useSelector(getUserIncentivizationDetails);

  const handleCreditsClick = () => {
    dispatch(
      incentivizationActions.toggleActiveModal({
        modalName: IncentivizationModal.TASKS_LIST_MODAL,
        newValue: true,
        newProps: {
          source: INCENTIVIZATION_SOURCE.SIDEBAR,
        },
      })
    );
  };

  return (
    <>
      <RQButton className="primary-sidebar-link w-full" onClick={handleCreditsClick}>
        <div className="icon__wrapper">
          <Badge
            className="credits-earned-badge"
            size="small"
            status="default"
            count={
              (userMilestoneAndRewardDetails?.totalCreditsClaimed ?? 0) > 0 ? (
                <span className="credits-earned-count">${userMilestoneAndRewardDetails?.totalCreditsClaimed ?? 0}</span>
              ) : (
                0
              )
            }
          >
            <FiGift />
          </Badge>
        </div>
        <div className="link-title">Credits</div>
      </RQButton>
    </>
  );
};
