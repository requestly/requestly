import React from "react";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import "./onboardingHeader.scss";
import { useFeatureIsOn } from "@growthbook/growthbook-react";

interface OnboardingHeaderProps {
  hideCloseBtn?: boolean;
  onHeaderButtonClick: () => void;
}

const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ hideCloseBtn = false, onHeaderButtonClick }) => {
  const isBrowserstackIntegrationEnabled = useFeatureIsOn("browserstack_integration");
  return (
    <div className="onboarding-header">
      {isBrowserstackIntegrationEnabled ? (
        <img src="/assets/media/common/RQ-BStack Logo.svg" alt="Requestly by Browserstack" />
      ) : (
        <img
          style={{ width: 134, height: 45 }}
          src="/assets/media/common/rq_logo_full.svg"
          alt="Requestly by Browserstack"
        />
      )}
      {hideCloseBtn ? null : (
        <span className="onboarding-header-action" onClick={onHeaderButtonClick}>
          <IoMdClose />
        </span>
      )}
    </div>
  );
};

export default OnboardingHeader;
