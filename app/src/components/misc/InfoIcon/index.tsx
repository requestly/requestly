import React, { CSSProperties } from "react";
import { Tooltip } from "antd";
import { InfoCircleFilled } from "@ant-design/icons";
import { TooltipPlacement } from "antd/lib/tooltip";
import "./infoIcon.scss";

interface Props {
  text: string;
  tooltipPlacement?: TooltipPlacement;
  style?: CSSProperties;
  showArrow?: boolean;
}

const InfoIcon: React.FC<Props> = ({ text, tooltipPlacement = "bottomRight", style = {}, showArrow = true }) => {
  return (
    <Tooltip
      title={text}
      overlayClassName="info-icon-tooltip"
      placement={tooltipPlacement}
      arrowPointAtCenter
      showArrow={showArrow}
    >
      <InfoCircleFilled style={style} />
    </Tooltip>
  );
};

export default InfoIcon;
