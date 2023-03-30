import React, { ReactNode, useCallback } from "react";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { trackMoreInfoViewed } from "modules/analytics/events/misc/moreInfo";
import "./index.css";

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
  const showMoreInfoWithABTest = false; // temp flag for info icon experiment

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) trackMoreInfoViewed(analyticsContext, source);
    },
    [analyticsContext, source]
  );

  if (!showMoreInfoWithABTest) {
    return <>{children}</>;
  }

  return showIcon ? (
    <>
      {children}
      <Tooltip
        title={text}
        trigger={showMoreInfoWithABTest ? ["hover", "focus"] : [null]}
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
      trigger={showMoreInfoWithABTest ? ["hover", "focus"] : [null]}
      onOpenChange={handleOpenChange}
      showArrow={false}
      overlayInnerStyle={{ width: "300px" }}
    >
      {children}
    </Tooltip>
  );
};
