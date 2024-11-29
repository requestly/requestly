import React from "react";
import { Tooltip, TooltipProps } from "antd";
import "./RQTooltip.scss";

export const RQTooltip: React.FC<TooltipProps> = ({ overlayClassName, className, ...props }) => {
  return (
    <Tooltip
      {...props}
      className={`rq-tooltip ${className || ""}`}
      overlayClassName={`rq-tooltip ${overlayClassName || ""}`}
    />
  );
};
