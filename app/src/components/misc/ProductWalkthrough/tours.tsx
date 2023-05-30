import { Rule } from "types";
import { CustomSteps, pointerPlacement } from "./types";
import { generateRuleEditorTour, getTourTarget } from "./utils";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import FEATURES from "config/constants/sub/features";

const tourTooltipPresets = {
  disableBeacon: true,
  offset: 12,
  pointerPlacement: "center" as pointerPlacement,
};

export const productTours: Record<string, CustomSteps[]> = {
  [GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT]: generateRuleEditorTour([
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-destination-url"),
      title: "Add Destination URL",
      content: "The destination to which the users will be redirected to based on the source condition",
      placement: "bottom-start",
      disableNext: (ruleData: Rule) => !ruleData.pairs[0].destination?.length,
    },
  ]),
  [GLOBAL_CONSTANTS.RULE_TYPES.REPLACE]: generateRuleEditorTour([
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-replace-from"),
      title: "Replace string",
      content: "Enter to string that needs to be replaced from source condition",
      placement: "bottom-start",
      disableNext: (ruleData: Rule) => !ruleData.pairs[0].from?.length,
    },
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-replace-to"),
      title: "Replace with",
      content: "Add the new string here",
      placement: "bottom-start",
      disableNext: (ruleData: Rule) => !ruleData.pairs[0].to?.length,
    },
  ]),
  [GLOBAL_CONSTANTS.RULE_TYPES.CANCEL]: generateRuleEditorTour([]),
  [GLOBAL_CONSTANTS.RULE_TYPES.DELAY]: generateRuleEditorTour([
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-delay-value"),
      title: "Add Delay duration",
      content: "The delay time (in milliseconds) that is applied to the request matching the source condition.",
      offset: 8,
      placement: "bottom-start",
      disableNext: (ruleData: Rule) => !ruleData.pairs[0].delay?.length,
    },
  ]),
  [GLOBAL_CONSTANTS.RULE_TYPES.USERAGENT]: generateRuleEditorTour([
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-useragent-selector"),
      title: "Device/Browser Selector",
      content: "Select whether you want to test on a device or a browser.",
      offset: 20,
      pointerPlacement: "right-half",
      placement: "top",
      disableNext: (ruleData: Rule) => !ruleData.pairs[0].envType?.length,
    },
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-useragent-type"),
      title: "Device/Browser Type Selector",
      content: "Select or search the type of browser/device on which you want to test.",
      placement: "top",
      disableNext: (ruleData: Rule) => !ruleData.pairs[0].userAgent?.length,
    },
  ]),
  [FEATURES.DESKTOP_APP_TRAFFIC_TABLE]: [
    {
      ...tourTooltipPresets,
      target: getTourTarget("traffic-table-row"),
      title: "Right-click to modify request, copy cURL and more. Try it now!",
      content: null,
      placement: "bottom",
    },
  ],
  [FEATURES.CONNECTED_APPS]: [
    {
      ...tourTooltipPresets,
      target: getTourTarget("connected-apps-header-cta"),
      title: "Manage your connected apps here!",
      content: null,
      offset: 16,
      placement: "bottom",
      spotlightPadding: 7,
      disableOverlayClose: false,
    },
  ],
};
