import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Progress } from "antd";
import { MdRedeem } from "@react-icons/all-files/md/MdRedeem";
import { RedeemCreditsModal } from "features/incentivization";
import { Milestones, UserMilestoneDetails } from "features/incentivization/types";
import { getFunctions, httpsCallable } from "firebase/functions";
import { incentivizationActions } from "store/features/incentivization/slice";
import { Loading3QuartersOutlined } from "@ant-design/icons";
import {
  getIncentivizationMilestones,
  getIncentivizationUserMilestoneDetails,
} from "store/features/incentivization/selectors";
import { getTotalCredits } from "features/incentivization/utils";
import "./creditsProgessbar.scss";

export const CreditsProgressBar = () => {
  const dispatch = useDispatch();
  const [isRedeemModalVisible, setIsRedeemModalVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const milestones: Milestones = useSelector(getIncentivizationMilestones);
  const userMilestoneDetails: UserMilestoneDetails = useSelector(getIncentivizationUserMilestoneDetails);

  const totalCredits = useMemo(() => getTotalCredits(milestones), [milestones]);
  const progressPrecentage = parseInt(
    `${((userMilestoneDetails?.totalCreditsClaimed ?? 0) / Math.max(1, totalCredits)) * 100}`
  );

  useEffect(() => {
    const getUserMilestoneDetails = httpsCallable(getFunctions(), "incentivization-getUserMilestoneDetails");

    setIsLoading(true);
    getUserMilestoneDetails()
      .then((res: { data: { success: boolean; data: UserMilestoneDetails | null } }) => {
        if (res.data?.success) {
          dispatch(incentivizationActions.setUserMilestoneDetails({ userMilestoneDetails: res.data?.data }));
        }
      })
      .catch(() => {
        // do nothing
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

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
            <Button
              type="text"
              className="redeem-credits-btn"
              icon={<MdRedeem />}
              size="small"
              onClick={() => setIsRedeemModalVisible(true)}
            >
              Redeem
            </Button>
          </>
        )}
      </div>
      {isRedeemModalVisible && (
        <RedeemCreditsModal isOpen={isRedeemModalVisible} onClose={() => setIsRedeemModalVisible(false)} />
      )}
    </>
  );
};
