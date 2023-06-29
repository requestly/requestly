import React, { useEffect, useRef } from "react";
import { Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { CustomTooltipProps } from "../types";
//@ts-ignore
import TooltipPointer from "../../../../assets/icons/tooltip-pointer.svg";
import "./index.css";

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
  const nextButtonRef = useRef(null);
  useEffect(() => {
    if (step.autoMoveToNext && !step.disableNext?.(context)) {
      nextButtonRef.current?.click();
    }
  }, [context, step]);
  return (
    <div {...tooltipProps} className="tour-tooltip-container">
      <img
        className={`tour-tooltip-pointer tour-tooltip-pointer-${
          step.pointerPlacement.includes("bottom") ? "bottom" : "top"
        } tour-tooltip-pointer-${step.pointerPlacement}`}
        src={TooltipPointer}
        alt="tooltip pointer"
      />
      <CloseOutlined className="tour-close-icon" {...skipProps} />
      {/* show steps counter only when no of steps > 1 */}
      {size > 1 && <div className="tour-tooltip-progress">{index + 1 + "/" + size}</div>}
      <div className="title white">{step.title}</div>
      <div className="text-gray tour-tooltip-content">{step.content}</div>
      <div className="tour-tooltip-buttons-container">
        <Button
          type="default"
          ref={nextButtonRef}
          className="tour-tooltip-next-btn"
          style={{ visibility: step.showNext ? "visible" : "hidden" }}
          // used closeProps because primary props takes away the focus from input boxes when tooltip appears
          {...closeProps}
          disabled={step.disableNext?.(context)}
        >
          {step?.customNextButtonText ??
            (isLastStep ? (
              "Finish"
            ) : (
              <>
                Next <img alt="back" width="14px" height="12px" src="/assets/icons/leftArrow.svg" />
              </>
            ))}
        </Button>
      </div>
    </div>
  );
};
