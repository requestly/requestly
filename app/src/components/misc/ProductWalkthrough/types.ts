import { Step } from "react-joyride";
import { TooltipRenderProps } from "react-joyride";

export interface CustomSteps extends Step {
  disableNext?: (ruleData: any) => boolean;
  pointerPlacement?: "left" | "center" | "right";
}

export interface CustomTooltipProps extends Omit<TooltipRenderProps, "step"> {
  step: CustomSteps;
  context: unknown;
}
