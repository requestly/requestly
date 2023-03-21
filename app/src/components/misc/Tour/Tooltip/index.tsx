import React from "react";
import { useSelector } from "react-redux";
import { getCurrentlySelectedRuleData } from "store/selectors";
import { RQButton } from "lib/design-system/components";
import { TooltipRenderProps } from "react-joyride";
import { CloseOutlined } from "@ant-design/icons";
import { CustomSteps } from "../tours";
import "./index.css";

interface CustomTooltipProps extends Omit<TooltipRenderProps, "step"> {
  step: CustomSteps;
}

export const TourTooltip: React.FC<CustomTooltipProps> = ({
  index,
  step,
  isLastStep,
  size,
  skipProps,
  primaryProps,
  tooltipProps,
}) => {
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  // console.log("DATA", currentlySelectedRuleData, primaryProps);
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
          disabled={step.disableNext?.(currentlySelectedRuleData)}
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
