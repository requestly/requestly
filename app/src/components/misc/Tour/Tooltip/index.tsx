import { RQButton } from "lib/design-system/components";
import React from "react";
import { TooltipRenderProps } from "react-joyride";
import { CloseOutlined } from "@ant-design/icons";
import "./index.css";

export const TourTooltip: React.FC<TooltipRenderProps> = ({
  index,
  step,
  isLastStep,
  size,
  //   backProps,
  //   closeProps,
  skipProps,
  primaryProps,
  tooltipProps,
}) => {
  return (
    <div {...tooltipProps} className="tour-tooltip-container">
      <CloseOutlined className="tour-close-icon" {...skipProps} />
      <div className="tour-tooltip-progress">{index + 1 + "/" + size}</div>
      <div className="title white">{step.title}</div>
      <div className="text-gray tour-tooltip-content">{step.content}</div>
      <div className="tour-tooltip-buttons-container">
        <RQButton
          type="default"
          className="tour-tooltip-next-btn"
          {...primaryProps}
        >
          {isLastStep ? "Finish" : "Next"}

          <img
            alt="back"
            width="14px"
            height="12px"
            src="/assets/icons/leftArrow.svg"
          />
        </RQButton>
      </div>
    </div>
  );
};
