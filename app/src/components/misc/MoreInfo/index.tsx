import React, { ReactNode, useCallback } from "react";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { trackMoreInfoViewed } from "modules/analytics/events/misc/moreInfo";
import "./index.css";
import { useFeatureValue } from "@growthbook/growthbook-react";

interface InfoProps {
  children: ReactNode;
  text: string | ReactNode;
  showIcon: boolean;
  source: string;
  analyticsContext: string;
  trigger?: boolean;
  keepActive?: boolean;
  tooltipOpenedCallback?: () => void;
}

export const MoreInfo: React.FC<InfoProps> = ({
  children,
  text,
  showIcon,
  source,
  analyticsContext,
  trigger = true,
  keepActive = false, // flag for keeping a toolip/icon active even if experiment is not assigned
  tooltipOpenedCallback = () => {},
}) => {
  const redirectRuleOnboardingExp = useFeatureValue("redirect_rule_onboarding", null);
  const isMoreInfoActive = redirectRuleOnboardingExp === "tooltip" || keepActive;

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        trackMoreInfoViewed(analyticsContext, source);
        tooltipOpenedCallback();
      }
    },
    [analyticsContext, source, tooltipOpenedCallback]
  );

  if (!isMoreInfoActive) {
    return <>{children}</>;
  }

  return showIcon ? (
    <>
      {children}
      <Tooltip
        title={text}
        trigger={trigger && isMoreInfoActive ? ["hover", "focus"] : [null]}
        onOpenChange={handleOpenChange}
        showArrow={false}
        overlayInnerStyle={{ width: "300px" }}
      >
        <InfoCircleOutlined className="more-info-icon" />
      </Tooltip>
    </>
  ) : (
    <Tooltip
      title={text}
      trigger={trigger && isMoreInfoActive ? ["hover", "focus"] : [null]}
      onOpenChange={handleOpenChange}
      showArrow={false}
      overlayInnerStyle={{ width: "300px" }}
    >
      {children}
    </Tooltip>
  );
};
