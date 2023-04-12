import React, { ReactNode, useCallback } from "react";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { trackMoreInfoShown, trackMoreInfoViewed } from "modules/analytics/events/misc/moreInfo";
import "./index.css";
import { useFeatureValue } from "@growthbook/growthbook-react";

interface InfoProps {
  children: ReactNode;
  text: string | ReactNode;
  showIcon: boolean;
  source: string;
  analyticsContext: string;
}

export const MoreInfo: React.FC<InfoProps> = ({
  children,
  text,
  showIcon,
  source,
  analyticsContext,
}) => {
  const redirectRuleOnboardingExp = useFeatureValue("redirect_rule_onboarding", null);
  const isMoreInfoActive = redirectRuleOnboardingExp === "tooltip";

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) trackMoreInfoViewed(analyticsContext, source);
    },
    [analyticsContext, source]
  );

  if (!isMoreInfoActive) {
    return <>{children}</>;
  } else {
    trackMoreInfoShown(analyticsContext, source);
  }

  return showIcon ? (
    <>
      {children}
      <Tooltip
        title={text}
        trigger={isMoreInfoActive ? ["hover", "focus"] : [null]}
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
      trigger={isMoreInfoActive ? ["hover", "focus"] : [null]}
      onOpenChange={handleOpenChange}
      showArrow={false}
      overlayInnerStyle={{ width: "300px" }}
    >
      {children}
    </Tooltip>
  );
};
