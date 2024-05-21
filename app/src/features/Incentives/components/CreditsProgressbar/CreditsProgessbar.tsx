import { Button, Progress } from "antd";
import { MdRedeem } from "@react-icons/all-files/md/MdRedeem";
import { RedeemCreditsModal } from "features/Incentives";
import "./creditsProgessbar.scss";
import { useState } from "react";

export const CreditsProgressBar = () => {
  const [isRedeemModalVisible, setIsRedeemModalVisible] = useState(false);
  return (
    <>
      <div className="credits-progressbar-container">
        <Progress percent={50} showInfo={false} className="incentive-credits-progessbar" />
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
      </div>
      {isRedeemModalVisible && (
        <RedeemCreditsModal isOpen={isRedeemModalVisible} onClose={() => setIsRedeemModalVisible(false)} />
      )}
    </>
  );
};
