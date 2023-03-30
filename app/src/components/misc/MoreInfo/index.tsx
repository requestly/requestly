import React, { ReactNode } from "react";
import { Tooltip } from "antd";

interface InfoProps {
  children: ReactNode;
  text: string | ReactNode;
  icon: ReactNode;
  analyticsContext: string;
}

export const MoreInfo: React.FC<InfoProps> = ({
  children,
  text,
  icon,
  analyticsContext,
}) => {
  const showMoreInfoWithABTest = false; // temp flag for info icon experiment

  return (
    <Tooltip
      title={text}
      trigger={!icon && showMoreInfoWithABTest ? ["hover", "focus"] : [null]}
      showArrow={false}
      className="more-info-wrapper"
    >
      {children}
      <Tooltip
        title={text}
        trigger={icon && showMoreInfoWithABTest ? ["hover", "focus"] : [null]}
      >
        <>{icon && showMoreInfoWithABTest && icon}</>
      </Tooltip>
    </Tooltip>
  );
};
