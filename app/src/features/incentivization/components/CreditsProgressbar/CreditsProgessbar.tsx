import React, { useMemo, useState } from "react";
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
export const CreditsProgressBar: React.FC<{ isInModal?: boolean }> = ({ isInModal = true }) => {
  const [isRedeemModalVisible, setIsRedeemModalVisible] = useState(false);

  const isLoading = useSelector(getIsIncentivizationDetailsLoading);
  const milestones = useSelector(getIncentivizationMilestones);
  const userMilestoneDetails = useSelector(getIncentivizationUserMilestoneDetails);

  const totalCredits = useMemo(() => getTotalCredits(milestones), [milestones]);
  const progressPrecentage = parseInt(
    `${((userMilestoneDetails?.totalCreditsClaimed ?? 0) / Math.max(1, totalCredits)) * 100}`
  );

  return (
    <>
      <div className="credits-progressbar-container">
        {isLoading ? (
          <div className="loader">
            <Loading3QuartersOutlined spin />
          </div>
        ) : (
          <>
            <Progress percent={progressPrecentage} showInfo={false} className="incentive-credits-progessbar" />
            {/* TODO: HANDLE CREDITS EARNED COUNTER HERE */}
            <div className="credits-earned-counter">No credits earned</div>
            {isInModal ? (
              <Button
                type="text"
                className="redeem-credits-btn"
                icon={<MdRedeem />}
                size="small"
                onClick={() => setIsRedeemModalVisible(true)}
              >
                Redeem
              </Button>
            ) : null}
          </>
        )}
      </div>
      {isRedeemModalVisible && (
        <RedeemCreditsModal isOpen={isRedeemModalVisible} onClose={() => setIsRedeemModalVisible(false)} />
      )}
    </>
  );
};
