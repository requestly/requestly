import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Progress, Tooltip } from "antd";
import { MdRedeem } from "@react-icons/all-files/md/MdRedeem";
import { RedeemCreditsModal } from "features/incentivization";
import { Loading3QuartersOutlined } from "@ant-design/icons";
import {
  getIncentivizationMilestones,
  getUserIncentivizationDetails,
  getIsIncentivizationDetailsLoading,
} from "store/features/incentivization/selectors";
import { getTotalCredits } from "features/incentivization/utils";
import { getUserAuthDetails } from "store/selectors";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import "./creditsProgessbar.scss";
import APP_CONSTANTS from "config/constants";
import { actions } from "store";

interface CreditsProgressBarProps {
  source: string;
}

export const CreditsProgressBar: React.FC<CreditsProgressBarProps> = ({ source }) => {
  const [isRedeemModalVisible, setIsRedeemModalVisible] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const isLoading = useSelector(getIsIncentivizationDetailsLoading);
  const milestones = useSelector(getIncentivizationMilestones);
  const userMilestoneAndRewardDetails = useSelector(getUserIncentivizationDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);

  const isUserHasActiveSubscription = user?.details?.planDetails?.status === "active";
  const isUserInBillingTeam =
    billingTeams?.length && billingTeams?.some((team) => user?.details?.profile?.uid in team.members);

  const disableRedeem = isUserHasActiveSubscription || isUserInBillingTeam;

  const totalCredits = useMemo(() => getTotalCredits(milestones), [milestones]);
  const totalCreditsEarned = userMilestoneAndRewardDetails?.totalCreditsClaimed ?? 0;
  const progressPrecentage = parseInt(`${(totalCreditsEarned / Math.max(1, totalCredits)) * 100}`);
  const creditsToBeRedeemed = userMilestoneAndRewardDetails?.creditsToBeRedeemed ?? 0;
  const isAllCreditsRedeemed =
    Object.keys(milestones ?? {}).length === (userMilestoneAndRewardDetails?.claimedMilestoneLogs?.length ?? 0);

  const handleRedeemClick = () => {
    if (user?.loggedIn) {
      setIsRedeemModalVisible(true);
    } else {
      dispatch(
        // @ts-ignore
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
            warningMessage: "You must sign in to earn or redeem free credits.",
            eventSource: "incentivization",
          },
        })
      );
    }
  };

  return (
    <>
      {
        <div className="credits-redeem-container">
          {isAllCreditsRedeemed && creditsToBeRedeemed === 0 ? (
            <div className="all-credits-redeemed description">
              You have redeemed all available credits. No credits remain for redemption.
            </div>
          ) : (
            <>
              {creditsToBeRedeemed > 0 ? (
                <div className="description">
                  You currently have <span className="highlight">${creditsToBeRedeemed}</span> credits, which can be
                  redeemed for <span className="highlight">{creditsToBeRedeemed}</span> days of the Requestly
                  Professional plan.
                </div>
              ) : (
                <div className="description">
                  You currently have <span className="highlight">$0</span> credits, perform below tasks to earn credits,
                  and redeemed it for Requestly Pro plan.
                </div>
              )}

              <Tooltip
                overlayClassName="redeem-disable-tooltip"
                title={disableRedeem ? "You already have an active subscription!" : null}
              >
                <Button
                  size="small"
                  disabled={disableRedeem}
                  icon={<MdRedeem className="anticon" />}
                  className="redeem-credits-btn"
                  onClick={handleRedeemClick}
                >
                  Redeem now
                </Button>
              </Tooltip>
            </>
          )}
        </div>
      }

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
              percent={progressPrecentage === 0 ? 1 : progressPrecentage}
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
        <RedeemCreditsModal
          isOpen={isRedeemModalVisible}
          onClose={() => setIsRedeemModalVisible(false)}
          userMilestoneAndRewardDetails={userMilestoneAndRewardDetails}
          source={source}
        />
      )}
    </>
  );
};
