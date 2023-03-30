import React, { ReactNode } from "react";
import { Tooltip } from "antd";
import { trackMoreInfoViewed } from "modules/analytics/events/misc/moreInfo";

interface InfoProps {
  children: ReactNode;
  text: string | ReactNode;
  icon: ReactNode;
  source: string;
  analyticsContext: string;
}

export const MoreInfo: React.FC<InfoProps> = ({
  children,
  text,
  icon,
  source,
  analyticsContext,
}) => {
  const showMoreInfoWithABTest = false; // temp flag for info icon experiment

  return (
    <Tooltip
      title={text}
      trigger={!icon && showMoreInfoWithABTest ? ["hover", "focus"] : [null]}
      onOpenChange={(open) => {
        if (open) trackMoreInfoViewed(analyticsContext, source);
      }}
      showArrow={false}
      overlayInnerStyle={{ width: "300px" }}
      className="more-info-wrapper"
    >
      {children}
      <Tooltip
        title={text}
        trigger={icon && showMoreInfoWithABTest ? ["hover", "focus"] : [null]}
        onOpenChange={(open) => {
          if (open) trackMoreInfoViewed(analyticsContext, source);
        }}
      >
        <>{icon && showMoreInfoWithABTest && icon}</>
      </Tooltip>
    </Tooltip>
  );
};
