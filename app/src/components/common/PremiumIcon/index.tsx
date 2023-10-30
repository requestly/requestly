import React from "react";
import { Link } from "react-router-dom";
import { Tooltip, TooltipProps } from "antd";
import { ReactComponent as CrownIcon } from "assets/icons/crown.svg";
import PATHS from "config/constants/sub/paths";
import {
  FeatureType,
  PaidFeatureNudgeViewedSource,
  trackPaidFeatureNudgeViewed,
  trackViewPricingPlansClicked,
} from "modules/analytics/events/common/pricing";
import "./premiumIcon.css";

export const PremiumIcon: React.FC<
  TooltipProps & { onSeePlansClick?: () => void } & {
    featureType: FeatureType;
    source?: PaidFeatureNudgeViewedSource;
  }
> = (props) => {
  return (
    <Tooltip
      {...props}
      onOpenChange={(isOpen) => {
        if (isOpen) trackPaidFeatureNudgeViewed(props.featureType, props.source);
      }}
      title={
        <div>
          This is a paid feature. Consider upgrading for uninterrupted usage.{" "}
          <Link
            to={PATHS.PRICING.RELATIVE}
            className="see-plans-link"
            onClick={(e) => {
              e.stopPropagation();
              trackViewPricingPlansClicked("crown");
              props.onSeePlansClick?.();
            }}
          >
            See plans
          </Link>
        </div>
      }
    >
      <span className="premium-icon">
        <CrownIcon />
      </span>
    </Tooltip>
  );
};
