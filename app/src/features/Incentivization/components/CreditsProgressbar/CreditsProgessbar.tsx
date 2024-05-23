import { Button, Progress } from "antd";
import { MdRedeem } from "@react-icons/all-files/md/MdRedeem";
import "./creditsProgessbar.scss";

export const CreditsProgressBar = () => {
  return (
    <div className="credits-progressbar-container">
      <Progress percent={50} showInfo={false} className="incentive-credits-progessbar" />
      {/* TODO: HANDLE CREDITS EARNED COUNTER HERE */}
      <div className="credits-earned-counter">No credits earned</div>
      <Button type="text" className="redeem-credits-btn" icon={<MdRedeem />} size="small">
        redeem
      </Button>
    </div>
  );
};
