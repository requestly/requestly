import { Rule } from "@requestly/shared/types/entities/rules";
import { CustomSteps, PointerPlacement } from "./types";

export const getTourTarget = (tourId: string) => `[data-tour-id="${tourId}"]`;

export const generateRuleEditorTour = (ruleSpecificTour: CustomSteps[]) => {
  return [
    {
      target: getTourTarget("rule-editor-title"),
      title: "Start by adding the “Rule name”",
      content: "Rule name will help you find the rule easily.",
      disableBeacon: true,
      offset: 12,
      placement: "bottom-start",
      pointerPlacement: PointerPlacement.TOP_50,
      showNext: true,
      disableNext: (ruleData: Rule) => !ruleData.name.length,
    },
    {
      target: getTourTarget("rule-editor-source"),
      title: "Add Source condition to set criteria for the rules",
      content: `
        You can use URL , Host or Path with Regex,
        Contains, Wildcard or Equals to match the source request.
      `,
      disableBeacon: true,
      offset: 12,
      pointerPlacement: PointerPlacement.TOP_50,
      placement: "bottom-start",
      showNext: true,
      disableNext: (ruleData: Rule) => !ruleData.pairs[0].source.value?.length,
    },
    ...ruleSpecificTour,
    {
      target: getTourTarget("rule-editor-create-btn"),
      title: "Save the rule",
      content: "Click here to Create and Save the rule.",
      disableBeacon: true,
      offset: 12,
      pointerPlacement: PointerPlacement.TOP_100,
      placement: "bottom-start",
      showNext: true,
    },
  ];
};
