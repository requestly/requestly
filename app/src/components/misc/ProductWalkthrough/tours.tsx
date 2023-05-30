import { Rule } from "types";
import { CustomSteps } from "./types";
import { generateRuleEditorTour, getTourTarget } from "./utils";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import FEATURES from "config/constants/sub/features";

export const productTours: Record<string, CustomSteps[]> = {
  [GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT]: generateRuleEditorTour([
    {
      target: getTourTarget("rule-editor-destination-url"),
      title: "Add Destination URL",
      content: "The destination to which the users will be redirected to based on the source condition",
      disableBeacon: true,
      offset: 12,
      pointerPlacement: "center",
      placement: "bottom-start",
      disableNext: (ruleData: Rule) => !ruleData.pairs[0].destination?.length,
    },
  ]),
  [GLOBAL_CONSTANTS.RULE_TYPES.CANCEL]: generateRuleEditorTour([]),
  [GLOBAL_CONSTANTS.RULE_TYPES.DELAY]: generateRuleEditorTour([
    {
      target: getTourTarget("rule-editor-delay-value"),
      title: "Add Delay duration",
      content: "The delay time (in milliseconds) that is applied to the request matching the source condition.",
      disableBeacon: true,
      offset: 8,
      pointerPlacement: "center",
      placement: "bottom-start",
      disableNext: (ruleData: Rule) => !ruleData.pairs[0].delay?.length,
    },
  ]),
  // [GLOBAL_CONSTANTS.RULE_TYPES.USERAGENT]: generateRuleEditorTour([
  //   {
  //     target: getTourTarget("rule-editor-useragent-type"),
  //     title: "Select a user-agent type you want to emulate",
  //     content: "Select either devices, browsers or add your own custom user agent",
  //     disableBeacon: true,
  //     offset: 12,
  //     pointerPlacement: "center",
  //     placement: "top",
  //     // disableNext: (ruleData: Rule) => !ruleData.pairs[0].delay?.length,
  //   },
  // ]),
  [FEATURES.DESKTOP_APP_TRAFFIC_TABLE]: [
    {
      target: getTourTarget("traffic-table-row"),
      title: "Right-click to modify request, copy cURL and more. Try it now!",
      content: null,
      disableBeacon: true,
      offset: 12,
      pointerPlacement: "center",
      placement: "bottom",
    },
  ],
  [FEATURES.CONNECTED_APPS]: [
    {
      target: getTourTarget("connected-apps-header-cta"),
      title: "Manage your connected apps here!",
      content: null,
      disableBeacon: true,
      offset: 16,
      pointerPlacement: "center",
      placement: "bottom",
      spotlightPadding: 7,
      disableOverlayClose: false,
    },
  ],
};
