import React from "react";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import "./onboardingHeader.scss";

interface OnboardingHeaderProps {
  hideCloseBtn?: boolean;
  onHeaderButtonClick: () => void;
}

const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ hideCloseBtn = false, onHeaderButtonClick }) => {
  return (
    <div className="onboarding-header">
      <img src="/assets/media/common/RQ-BStack Logo.svg" alt="Requestly by Browserstack" />
      {hideCloseBtn ? null : (
        <span className="onboarding-header-action" onClick={onHeaderButtonClick}>
          <IoMdClose />
        </span>
      )}
    </div>
  );
};

export default OnboardingHeader;
