import LottieAnimation from "componentsV2/LottieAnimation/LottieAnimation";
import giftAnimation from "./assets/gift.json";
import { CreditsProgressBar, IncentiveSectionHeader } from "features/Incentives";
import { RQButton } from "lib/design-system/components";
import "./incentivesCard.scss";
import { useDispatch } from "react-redux";
import { actions } from "store";

export const IncentivesCard = () => {
  const dispatch = useDispatch();

  const handleOpenIncentiveChecklistModal = () => {
    // @ts-ignore
    dispatch(
      actions.toggleActiveModal({
        modalName: "creditsModal",
        newValue: true,
      })
    );
  };

  return (
    <div className="incentives-card-content">
      <div className="incentive-lottie-animation-container">
        <LottieAnimation animationData={giftAnimation} animationName="member added successfully" />
      </div>
      <div className="align-self-center">
        <IncentiveSectionHeader title="Earn $65 Free credits — Complete your Requestly setup!" />
        <div className="mt-24">
          <CreditsProgressBar />
        </div>
      </div>
      <div className="align-self-center display-row-center flex-1">
        <RQButton type="primary" onClick={handleOpenIncentiveChecklistModal}>
          Complete onboarding
        </RQButton>
      </div>
    </div>
  );
};
