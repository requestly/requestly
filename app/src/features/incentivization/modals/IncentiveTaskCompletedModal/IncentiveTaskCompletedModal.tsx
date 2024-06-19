import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "antd";
import { RQButton } from "lib/design-system/components";
import { IncentivizeEvent } from "features/incentivization/types";
import { getIncentivizationMilestones, getUserIncentivizationDetails } from "store/features/incentivization/selectors";
import { getTotalCredits } from "features/incentivization/utils";
import LottieAnimation from "componentsV2/LottieAnimation/LottieAnimation";
import creditsEarnedAnimation from "./assets/creditsEarned.json";
import { actions } from "store";
import { INCENTIVIZATION_SOURCE } from "features/incentivization/analytics/constants";
import { trackCreditsAssignedModalClicked, trackCreditsAssignedModalViewed } from "features/incentivization/analytics";
import "./incentiveTaskCompletedModal.scss";
import { getUserAuthDetails } from "store/selectors";
import APP_CONSTANTS from "config/constants";
import { IncentivizationModal } from "store/features/incentivization/types";
import { incentivizationActions } from "store/features/incentivization/slice";

interface IncentiveTaskCompletedModalProps {
  isOpen: boolean;
  toggle: () => void;
  event: IncentivizeEvent;
}

export const IncentiveTaskCompletedModal: React.FC<IncentiveTaskCompletedModalProps> = ({ isOpen, toggle, event }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const milestones = useSelector(getIncentivizationMilestones);
  const userMilestoneAndRewardDetails = useSelector(getUserIncentivizationDetails);
  const taskValue = (milestones?.[event]?.reward?.value as number) ?? 0;

  useEffect(() => {
    if (isOpen) {
      trackCreditsAssignedModalViewed(taskValue, event);
    }
  }, [taskValue, event, isOpen]);

  if (!milestones || !event) {
    return null;
  }

  const congratulationMesssages: Record<IncentivizeEvent, { message: string }> = {
    [IncentivizeEvent.RULE_CREATED]: {
      message: `You earned $${
        (milestones?.[IncentivizeEvent.RULE_CREATED]?.reward.value ?? 0) as number
      } on creating your first rule.`,
    },
    [IncentivizeEvent.TEAM_WORKSPACE_CREATED]: {
      message: `You earned $${
        (milestones?.[IncentivizeEvent.TEAM_WORKSPACE_CREATED]?.reward.value ?? 0) as number
      } on creating your first team workspace.`,
    },
    [IncentivizeEvent.RULE_TESTED]: {
      message: `You earned $${
        (milestones?.[IncentivizeEvent.RULE_TESTED]?.reward.value ?? 0) as number
      } on testing your first rule.`,
    },
    [IncentivizeEvent.RESPONSE_RULE_CREATED]: {
      message: `You earned $${
        (milestones?.[IncentivizeEvent.RESPONSE_RULE_CREATED]?.reward.value ?? 0) as number
      } on creating your first response rule.`,
    },
    [IncentivizeEvent.REDIRECT_RULE_CREATED]: {
      message: `You earned $${
        (milestones?.[IncentivizeEvent.REDIRECT_RULE_CREATED]?.reward.value ?? 0) as number
      } on creating your first redirect rule.`,
    },
    [IncentivizeEvent.MOCK_CREATED]: {
      message: `You earned $${
        (milestones?.[IncentivizeEvent.MOCK_CREATED]?.reward.value ?? 0) as number
      } on creating your first mock.`,
    },
    [IncentivizeEvent.SESSION_RECORDED]: {
      message: `You earned $${
        (milestones?.[IncentivizeEvent.SESSION_RECORDED]?.reward.value ?? 0) as number
      } on recording your first session.`,
    },
    [IncentivizeEvent.RATE_ON_CHROME_STORE]: {
      message: `You earned $${
        (milestones?.[IncentivizeEvent.RATE_ON_CHROME_STORE]?.reward.value ?? 0) as number
      } for rating us.`,
    },
  };

  const totalCredits = getTotalCredits(milestones);
  const remainingCredits = totalCredits - (userMilestoneAndRewardDetails?.totalCreditsClaimed ?? 0);
  const remainingTasksCount =
    Object.keys(milestones ?? {}).length - (userMilestoneAndRewardDetails?.claimedMilestoneLogs?.length ?? 0);

  const handleSignupClick = () => {
    toggle();

    dispatch(
      // @ts-ignore
      actions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
          eventSource: "incentivization",
        },
      })
    );
  };

  return (
    <Modal
      width={368}
      open={isOpen}
      onCancel={toggle}
      maskClosable={false}
      footer={null}
      className="custom-rq-modal task-completed-modal"
      zIndex={2000}
    >
      <div className="task-completed-modal-body">
        <LottieAnimation
          animationData={creditsEarnedAnimation}
          animationName="credits earned"
          className="credits-earned-animation"
        />
        <div className="task-completed-modal-title">Congratulations!</div>
        <div className="task-completed-modal-subtitle">{congratulationMesssages[event]?.message}</div>
        <div className="task-completed-modal-description">
          {user?.loggedIn ? (
            remainingCredits === 0 ? (
              <>You have unlocked all the free credits.</>
            ) : (
              <>
                Unlock an additional ${remainingCredits} worth of free credits by completing these {remainingTasksCount}{" "}
                {remainingTasksCount > 1 ? "steps" : "step"}.
              </>
            )
          ) : (
            <>Sign up to create an account and redeem these credits.</>
          )}
        </div>
        <div className="task-completed-actions-container">
          {user?.loggedIn ? (
            <>
              <RQButton
                type="primary"
                onClick={() => {
                  trackCreditsAssignedModalClicked(remainingTasksCount === 0 ? "redeem_now" : "complete_now");
                  dispatch(
                    incentivizationActions.toggleActiveModal({
                      modalName: IncentivizationModal.TASKS_LIST_MODAL,
                      newValue: true,
                      newProps: {
                        source: INCENTIVIZATION_SOURCE.TASK_COMPLETED_MODAL,
                      },
                    })
                  );
                  toggle();
                }}
              >
                {remainingTasksCount === 0 ? "Redeem now" : "Complete now"}
              </RQButton>
              <RQButton
                type="default"
                onClick={() => {
                  trackCreditsAssignedModalClicked("remind_me_later");
                  toggle();
                }}
              >
                Remind me later
              </RQButton>
            </>
          ) : (
            <>
              <RQButton type="primary" onClick={handleSignupClick}>
                Sign up
              </RQButton>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
