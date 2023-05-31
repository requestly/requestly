import { Rule } from "types";
import { CustomSteps, pointerPlacement } from "./types";
import { generateRuleEditorTour, getTourTarget, getTourTargetByClassName } from "./utils";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import FEATURES from "config/constants/sub/features";

const tourTooltipPresets = {
  disableBeacon: true,
  offset: 12,
  showNext: true,
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
  [GLOBAL_CONSTANTS.RULE_TYPES.HEADERS]: generateRuleEditorTour([
    {
      ...tourTooltipPresets,
      target: getTourTargetByClassName("ant-tabs-nav-wrap"),
      title: "Request/Response Headers",
      content: "Select this tab to modify the Request/Response Headers of the Request.",
      placement: "bottom-start",
      pointerPlacement: "left-half",
    },
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-header-modification-types"),
      title: "Request/Response Headers",
      content: "Select this tab to modify the Request/Response Headers of the Request.",
      placement: "top",
      pointerPlacement: "left",
      showNext: false,
      autoMoveToNext: true,
      offset: 20,
      disableNext: (ruleData: Rule) =>
        !ruleData.pairs[0].modifications.Request?.length && !ruleData.pairs[0].modifications.Response?.length,
    },
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-header-modification-row"),
      title: "Header Modification",
      content:
        "This is where the header modification will happen. Search or type the header name you want to add/override and type its corresponding value. For removing the header just type the header name",
      placement: "top",
      pointerPlacement: "center",
      offset: 18,
      spotlightPadding: 2,
    },
  ]),
  // rule-editor-queryparam-modification-row
  [GLOBAL_CONSTANTS.RULE_TYPES.QUERYPARAM]: generateRuleEditorTour([
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-queryparam-modification-type"),
      title: "Select modification type",
      content:
        "Select the type of modification you want to do on query params. You can add/repalce params, remove a specific param or remove all query params from the URL that matches the source condition.",
      placement: "top",
      pointerPlacement: "center",
      offset: 18,
    },
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-queryparam-modification-row"),
      title: "Query params Modification",
      content:
        "This is where the modification will happen. Type the param name you want to add/replace and type its corresponding value. For removing a specific param just type the param name. For removing all just select the Remove all option from modification menu.",
      placement: "bottom",
      pointerPlacement: "center",
      offset: 18,
    },
  ]),
  [GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE]: generateRuleEditorTour([]),

  [GLOBAL_CONSTANTS.RULE_TYPES.REQUEST]: generateRuleEditorTour([
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-requestbody-types"),
      title: "Select Request override method",
      content:
        "Select the method to override the API request body with static data or programmatically modify the existing request payload.",
      placement: "bottom",
      pointerPlacement: "left-half",
      offset: 20,
    },
    {
      ...tourTooltipPresets,
      target: getTourTarget("code-editor"),
      title: "Request body",
      content: "Define the request body which must be passed to the server.",
      placement: "top",
      offset: 16,
    },
  ]),
  [GLOBAL_CONSTANTS.RULE_TYPES.SCRIPT]: generateRuleEditorTour([
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-script-language"),
      title: "Script Language",
      content: "Select specific script language (JS/CSS) that needs to be inserted.",
      placement: "top",
      offset: 18,
    },
    {
      ...tourTooltipPresets,
      target: getTourTarget("code-editor"),
      title: "Script",
      content: "Add the script you want to inject here.",
      placement: "top",
      offset: 16,
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
