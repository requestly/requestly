import LottieAnimation from "componentsV2/LottieAnimation/LottieAnimation";
import giftAnimation from "./assets/gift.json";
import { CreditsProgressBar, INCENTIVIZATION_SOURCE, IncentiveSectionHeader } from "features/incentivization";
import { RQButton } from "lib/design-system/components";
import { getUserAuthDetails } from "store/selectors";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import "./incentivesCard.scss";

export const IncentivesCard = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);

  return (
    <>
      <div className="incentives-card-content">
        <div className="incentive-lottie-animation-container">
          <LottieAnimation animationData={giftAnimation} animationName="member added successfully" />
        </div>
        <div className="align-self-center">
          <IncentiveSectionHeader title="Earn $65 Free credits — Complete your Requestly setup!" />
          <div className="mt-16">
            <CreditsProgressBar source={INCENTIVIZATION_SOURCE.HOME_SCREEN} />
          </div>
        </div>
        <div className="align-self-center display-row-center flex-1">
          <RQButton
            type="primary"
            onClick={() => {
              if (user?.loggedIn) {
                // @ts-ignore
                dispatch(
                  actions.toggleActiveModal({
                    modalName: "incentiveTasksListModal",
                    newValue: true,
                    newProps: {
                      source: INCENTIVIZATION_SOURCE.HOME_SCREEN,
                    },
                  })
                );
              } else {
                dispatch(
                  // @ts-ignore
                  actions.toggleActiveModal({
                    modalName: "authModal",
                    newValue: true,
                    newProps: {
                      authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
                      warningMessage: "You must sign in to earn credits.",
                    },
                  })
                );
              }
            }}
          >
            Complete onboarding
          </RQButton>
        </div>
      </div>
    </>
  );
};
