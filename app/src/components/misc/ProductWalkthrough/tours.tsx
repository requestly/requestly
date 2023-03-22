//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { Step } from "react-joyride";

export interface CustomSteps extends Step {
  disableNext?: (ruleData: any) => boolean;
  pointerPlacement?: "left" | "center" | "right";
}

export const ProductTours: Record<string, CustomSteps[]> = {
  [GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT]: [
    {
      target: "#editor-title",
      title: "Start by adding the “Rule name”",
      content: "Rule name will help you find the rule easily.",
      disableBeacon: true,
      offset: 12,
      placement: "bottom-start",
      pointerPlacement: "center",
      disableNext: (ruleData) => (ruleData.name.length ? false : true),
    },
    {
      target: "#editor-source-condition",
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
      disableNext: (ruleData) =>
        ruleData.pairs[0].source.value.length ? false : true,
    },
    {
      target: "#destination-url",
      title: "Add Destination URL",
      content:
        "The destination to which the users will be redirected to based on the source condition",
      disableBeacon: true,
      offset: 12,
      pointerPlacement: "center",
      placement: "bottom-start",
      disableNext: (ruleData) =>
        ruleData.pairs[0].destination.length ? false : true,
    },
    {
      target: "#rule-editor-primary-btn",
      title: "Save the rule",
      content: "Click here to Create and Save the rule.",
      disableBeacon: true,
      offset: 12,
      pointerPlacement: "right",
      placement: "bottom-start",
    },
  ],
};
