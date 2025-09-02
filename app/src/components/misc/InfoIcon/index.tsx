import React, { CSSProperties } from "react";
import { Tooltip } from "antd";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import { TooltipPlacement } from "antd/lib/tooltip";
import "./infoIcon.scss";

interface Props {
  text: React.ReactNode;
  tooltipPlacement?: TooltipPlacement;
  style?: CSSProperties;
  showArrow?: boolean;
  danger?: boolean;
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
      <MdOutlineInfo style={style} />
    </Tooltip>
  );
};

export default InfoIcon;
