import React from "react";
import { RQButton } from "lib/design-system/components";
import { TooltipRenderProps } from "react-joyride";
import { CloseOutlined } from "@ant-design/icons";
import { CustomSteps } from "../tours";
//@ts-ignore
import TooltipPointer from "../../../../assets/icons/tooltip-pointer.svg";
import "./index.css";

interface CustomTooltipProps extends Omit<TooltipRenderProps, "step"> {
  step: CustomSteps;
  context: any;
}

export const WalkthroughTooltip: React.FC<CustomTooltipProps> = ({
  index,
  step,
  isLastStep,
  size,
  skipProps,
  closeProps,
  tooltipProps,
  context,
}) => {
  return (
    <div {...tooltipProps} className="tour-tooltip-container">
      <img
        className={`tour-tooltip-pointer tour-tooltip-pointer-${step.pointerPlacement}`}
        src={TooltipPointer}
        alt="tooltip pointer"
      />
      <CloseOutlined className="tour-close-icon" {...skipProps} />
      <div className="tour-tooltip-progress">{index + 1 + "/" + size}</div>
      <div className="title white">{step.title}</div>
      <div className="text-gray tour-tooltip-content">{step.content}</div>
      <div className="tour-tooltip-buttons-container">
        <RQButton
          type="default"
          className="tour-tooltip-next-btn"
          // used closeProps because primary props takes away the focus from input boxes when tooltip appears
          {...closeProps}
          disabled={step.disableNext?.(context)}
        >
          {isLastStep ? (
            "Finish"
          ) : (
            <>
              Next{" "}
              <img
                alt="back"
                width="14px"
                height="12px"
                src="/assets/icons/leftArrow.svg"
              />
            </>
          )}
        </RQButton>
      </div>
    </div>
  );
};
