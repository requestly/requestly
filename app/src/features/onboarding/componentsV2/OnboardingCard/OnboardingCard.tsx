import React, { ReactNode } from "react";
import "./onboardingCard.scss";

interface OnboardingCardProps {
  children: ReactNode;
  height?: number;
}
export const OnboardingCard: React.FC<OnboardingCardProps> = ({ children, height = "auto" }) => {
  return (
    <div className="rq-onboarding-card" style={{ height }}>
      {children}
    </div>
  );
};
