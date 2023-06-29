import { Step } from "react-joyride";
import { TooltipRenderProps } from "react-joyride";

export enum PointerPlacement {
  TOP_0 = "top-0",
  TOP_25 = "top-25",
  TOP_50 = "top-50",
  TOP_75 = "top-75",
  TOP_100 = "top-100",
  BOTTOM_0 = "bottom-0",
  BOTTOM_25 = "bottom-25",
  BOTTOM_50 = "bottom-50",
  BOTTOM_75 = "bottom-75",
  BOTTOM_100 = "bottom-100",
}

export interface CustomSteps extends Step {
  disableNext?: (ruleData: any) => boolean;
  showNext?: boolean;
  autoMoveToNext?: boolean;
  pointerPlacement?: PointerPlacement;
  customNextButtonText?: string;
}

export interface CustomTooltipProps extends Omit<TooltipRenderProps, "step"> {
  step: CustomSteps;
  context: unknown;
}
