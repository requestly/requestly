import React from "react";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { IoMdArrowForward } from "@react-icons/all-files/io/IoMdArrowForward";
import { useIsBrowserStackIntegrationOn } from "hooks/useIsBrowserStackIntegrationOn";
import "./onboardingHeader.scss";

interface OnboardingHeaderProps {
  hideCloseBtn?: boolean;
  isOnboarding?: boolean;
  onHeaderButtonClick: () => void;
}

const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  hideCloseBtn = false,
  isOnboarding = false,
  onHeaderButtonClick,
}) => {
  const isBrowserStackIntegrationOn = useIsBrowserStackIntegrationOn();
  return (
    <div className="onboarding-header">
      {isBrowserStackIntegrationOn ? (
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
      {isOnboarding ? (
        <div className="onboarding-header-action skip-onboarding-btn" onClick={onHeaderButtonClick}>
          <span>Skip for now</span> <IoMdArrowForward />
        </div>
      ) : null}
    </div>
  );
};

export default OnboardingHeader;
