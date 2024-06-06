import React from "react";
import { useSelector } from "react-redux";
import { Modal } from "antd";
import { RQButton } from "lib/design-system/components";
import giftIcon from "./assets/gift.svg";
import "./incentiveTaskCompletedModal.scss";
import { IncentivizeEvent } from "features/incentivization/types";
import {
  getIncentivizationMilestones,
  getIncentivizationUserMilestoneDetails,
} from "store/features/incentivization/selectors";
import { getTotalCredits } from "features/incentivization/utils";

interface IncentiveTaskCompletedModalProps {
  isOpen: boolean;
  toggle: () => void;
  event: IncentivizeEvent;
}

export const IncentiveTaskCompletedModal: React.FC<IncentiveTaskCompletedModalProps> = ({ isOpen, toggle, event }) => {
  const milestones = useSelector(getIncentivizationMilestones);
  const userMilestoneDetails = useSelector(getIncentivizationUserMilestoneDetails);

  if (!milestones || !event) {
    return null;
  }

  const congratulationMesssages: Record<IncentivizeEvent, { message: string }> = {
    [IncentivizeEvent.FIRST_RULE_CREATED]: {
      message: `You earned $${
        (milestones?.[IncentivizeEvent.FIRST_RULE_CREATED]?.value ?? 0) as number
      } on creating your first rule.`,
    },
    [IncentivizeEvent.FIRST_TEAM_WORKSPACE_CREATED]: {
      message: `You earned $${
        (milestones?.[IncentivizeEvent.FIRST_TEAM_WORKSPACE_CREATED]?.value ?? 0) as number
      } on creating your first team workspace.`,
    },
    [IncentivizeEvent.PREMIUM_RULE_CREATED]: {
      message: `You earned $${
        (milestones?.[IncentivizeEvent.PREMIUM_RULE_CREATED]?.value ?? 0) as number
      } on a premium rule.`,
    },
    [IncentivizeEvent.FIRST_MOCK_CREATED]: {
      message: `You earned $${
        (milestones?.[IncentivizeEvent.PREMIUM_RULE_CREATED]?.value ?? 0) as number
      } on creating your first mock.`,
    },
    [IncentivizeEvent.FIRST_SESSION_RECORDED]: {
      message: `You earned $${
        (milestones?.[IncentivizeEvent.PREMIUM_RULE_CREATED]?.value ?? 0) as number
      } on recording your session.`,
    },
    [IncentivizeEvent.RATE_ON_CHROME_STORE]: {
      message: `You earned $${
        (milestones?.[IncentivizeEvent.PREMIUM_RULE_CREATED]?.value ?? 0) as number
      } for rating us.`,
    },
  };

  const totalCredits = getTotalCredits(milestones);
  const remainingCredits = totalCredits - (userMilestoneDetails?.totalCreditsClaimed ?? 0);
  const remainingTasksCount =
    Object.keys(milestones ?? {}).length - (userMilestoneDetails?.claimedMilestoneLogs?.length ?? 0);

  console.log("IncentiveTaskCompletedModal", { event, isOpen, totalCredits, remainingCredits, remainingTasksCount });

  return (
    <Modal width={368} open={isOpen} onCancel={toggle} className="custom-rq-modal task-completed-modal" footer={null}>
      <div className="task-completed-modal-body">
        {/* TODO: REPLACE WITH DIFFERENT ASSEST */}
        <img src={giftIcon} alt="gift" />
        <div className="task-completed-modal-title">Congratulations!</div>
        <div className="task-completed-modal-subtitle">{congratulationMesssages[event]?.message}</div>
        <div className="task-completed-modal-description">
          {remainingCredits === 0 ? (
            <>You have unlocked all the free credits.</>
          ) : (
            <>
              Unlock an additional ${remainingCredits} worth of free credits by completing these {remainingTasksCount}{" "}
              steps.
            </>
          )}
        </div>
        <div className="task-completed-actions-container">
          <RQButton type="primary">Complete now</RQButton>
          <RQButton type="default" onClick={toggle}>
            Remind me later
          </RQButton>
        </div>
      </div>
    </Modal>
  );
};
