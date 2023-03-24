//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { Step } from "react-joyride";

export interface CustomSteps extends Step {
  disableNext?: (ruleData: any) => boolean;
  pointerPlacement?: "left" | "center" | "right";
}

const tourTarget = (tourId: string) => `[data-tour-id="${tourId}"]`;

export const productTours: Record<string, CustomSteps[]> = {
  [GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT]: [
    {
      target: tourTarget("rule-editor-title"),
      title: "Start by adding the “Rule name”",
      content: "Rule name will help you find the rule easily.",
      disableBeacon: true,
      offset: 12,
      placement: "bottom-start",
      pointerPlacement: "center",
      disableNext: (ruleData) => !ruleData.name.length,
    },
    {
      target: tourTarget("rule-editor-source"),
      title: "Add Source condition to set criteria for the rules",
      content: (
        <>
          You can use <strong>URL</strong> , <strong>Host</strong> or{" "}
          <strong>Path</strong> with <strong>Regex</strong>,
          <strong> Contains</strong>, <strong>Wildcard</strong> or{" "}
          <strong>Equals </strong>to match the source request.
        </>
      ),
      disableBeacon: true,
      offset: 12,
      pointerPlacement: "center",
      placement: "bottom-start",
      disableNext: (ruleData) => !ruleData.pairs[0].source.value?.length,
    },
    {
      target: tourTarget("rule-editor-destination-url"),
      title: "Add Destination URL",
      content:
        "The destination to which the users will be redirected to based on the source condition",
      disableBeacon: true,
      offset: 12,
      pointerPlacement: "center",
      placement: "bottom-start",
      disableNext: (ruleData) => !ruleData.pairs[0].destination?.length,
    },
    {
      target: tourTarget("rule-editor-create-btn"),
      title: "Save the rule",
      content: "Click here to Create and Save the rule.",
      disableBeacon: true,
      offset: 12,
      pointerPlacement: "right",
      placement: "bottom-start",
    },
  ],
};
