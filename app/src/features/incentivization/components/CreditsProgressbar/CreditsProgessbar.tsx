import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Progress } from "antd";
import { MdRedeem } from "@react-icons/all-files/md/MdRedeem";
import { RedeemCreditsModal } from "features/incentivization";
import { Loading3QuartersOutlined } from "@ant-design/icons";
import {
  getIncentivizationMilestones,
  getIncentivizationUserMilestoneDetails,
  getIsIncentivizationDetailsLoading,
} from "store/features/incentivization/selectors";
import { getTotalCredits } from "features/incentivization/utils";
import "./creditsProgessbar.scss";

// TODO: fix isInModal in redeem flow
/**
 * - show earned credits / total credits [DONE]
 * - handle all credits earned state
 * - add redeem cta in app header
 * - add redeem in checklist modal
 * - integrate backend with the UI
 * - test UI, subscription and DB states
 *  subs cases:
 *  - new subs
 *  - extend subs
 *  - restart subs
 *
 * credits cases:
 *  - if user node not exist in DB
 *  - if credits == 0
 *  - if credits > 0
 *
 *
 * backend [DONE]
 * - create backend function for redeeming the credits
 *    - update userMilestone node
 * - give strip subscription [IMP] (its trial only which we are giving to user)
 * - handle for active subscription extend it if again redeemed [IMP]
 */

export const CreditsProgressBar = () => {
  const [isRedeemModalVisible, setIsRedeemModalVisible] = useState(false);

  const isLoading = useSelector(getIsIncentivizationDetailsLoading);
  const milestones = useSelector(getIncentivizationMilestones);
  const userMilestoneDetails = useSelector(getIncentivizationUserMilestoneDetails);

  const totalCredits = useMemo(() => getTotalCredits(milestones), [milestones]);
  const totalCreditsEarned = userMilestoneDetails?.totalCreditsClaimed ?? 0;
  const progressPrecentage = parseInt(`${(totalCreditsEarned / Math.max(1, totalCredits)) * 100}`);

  return (
    <>
      <div className="credits-redeem-container">
        <div className="description">
          You currently have <span className="highlight">${totalCreditsEarned}</span> credits, which can be redeemed for{" "}
          <span className="highlight">{totalCreditsEarned}</span> days of the Requestly Professional plan.
        </div>

        <Button
          size="small"
          icon={<MdRedeem className="anticon" />}
          className="redeem-credits-btn"
          onClick={() => setIsRedeemModalVisible(true)}
        >
          Redeem now
        </Button>
      </div>
      <div className="credits-progressbar-container">
        {isLoading ? (
          <div className="loader">
            <Loading3QuartersOutlined spin />
          </div>
        ) : (
          <>
            <Progress
              showInfo={false}
              className="incentive-credits-progessbar"
              percent={progressPrecentage === 0 ? 2 : progressPrecentage}
            />
            <div className="credits-earned-counter">
              {totalCreditsEarned > 0 ? (
                <>
                  <span className="success">${totalCreditsEarned}</span> of ${totalCredits} credits earned
                </>
              ) : (
                "No credits earned"
              )}
            </div>
          </>
        )}
      </div>
      {isRedeemModalVisible && (
        <RedeemCreditsModal isOpen={isRedeemModalVisible} onClose={() => setIsRedeemModalVisible(false)} />
      )}
    </>
  );
};
