import React from "react";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { useAuthScreenContext } from "features/onboarding/screens/auth/context";
import { AuthScreenMode } from "features/onboarding/screens/auth/types";
import "./onboardingHeader.scss";

interface OnboardingHeaderProps {
  onHeaderButtonClick: () => void;
}

const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ onHeaderButtonClick }) => {
  const { authScreenMode } = useAuthScreenContext();

  return (
    <div className="onboarding-header">
      <img src="/assets/media/common/RQ-BStack Logo.svg" alt="Requestly by Browserstack" />
      {authScreenMode === AuthScreenMode.MODAL ? (
        <span className="onboarding-header-action" onClick={onHeaderButtonClick}>
          <IoMdClose />
        </span>
      ) : null}
    </div>
  );
};

export default OnboardingHeader;
