import React from "react";
import clsx from "clsx";
import { RQButton } from "lib/design-system-v2/components";
import "./premiumPlanBadge.scss";

interface UpgradePlanBadgeProps {
  icon: React.ReactNode;
  planStatusInfo: string;
  handleBadgeClick: () => void;
  badgeText: string;
  containerClassName?: string;
}

const UpgradePlanBadge: React.FC<UpgradePlanBadgeProps> = ({
  icon,
  planStatusInfo,
  handleBadgeClick,
  badgeText,
  containerClassName = "",
}) => {
  return (
    <div className={clsx("premium-plan-badge-container", containerClassName)}>
      {icon}
      <span className="premium-plan-name-info">{planStatusInfo}</span>
      <RQButton
        type="primary"
        shape="round"
        className="upgrade-button"
        onClick={handleBadgeClick}
        aria-label={badgeText}
        data-testid="upgrade-plan-badge-cta"
      >
        {badgeText}
      </RQButton>
    </div>
  );
};
export default UpgradePlanBadge;
