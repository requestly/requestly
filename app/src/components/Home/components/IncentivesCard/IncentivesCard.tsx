import LottieAnimation from "componentsV2/LottieAnimation/LottieAnimation";
import giftAnimation from "./assets/gift.json";
import { CreditsProgressBar, INCENTIVIZATION_SOURCE, IncentiveSectionHeader } from "features/incentivization";
import { RQButton } from "lib/design-system/components";
import { useDispatch, useSelector } from "react-redux";
import { getIncentivizationMilestones } from "store/features/incentivization/selectors";
import { getTotalCredits } from "features/incentivization/utils";
import { incentivizationActions } from "store/features/incentivization/slice";
import { IncentivizationModal } from "store/features/incentivization/types";
import "./incentivesCard.scss";

export const IncentivesCard = () => {
  const dispatch = useDispatch();
  const milestones = useSelector(getIncentivizationMilestones);
  const totalCredits = getTotalCredits(milestones);

  return (
    <>
      <div className="incentives-card-content">
        <div className="incentive-lottie-animation-container">
          <LottieAnimation animationData={giftAnimation} animationName="member added successfully" />
        </div>
        <div className="align-self-center">
          <IncentiveSectionHeader title={`Earn $${totalCredits} Free credits — Complete your Requestly setup!`} />
          <div className="mt-16">
            <CreditsProgressBar source={INCENTIVIZATION_SOURCE.HOME_SCREEN} />
          </div>
        </div>
        <div className="align-self-center display-row-center flex-1">
          <RQButton
            type="primary"
            onClick={() => {
              dispatch(
                incentivizationActions.toggleActiveModal({
                  modalName: IncentivizationModal.TASKS_LIST_MODAL,
                  newValue: true,
                  newProps: {
                    source: INCENTIVIZATION_SOURCE.HOME_SCREEN,
                  },
                })
              );
            }}
          >
            Complete onboarding
          </RQButton>
        </div>
      </div>
    </>
  );
};
