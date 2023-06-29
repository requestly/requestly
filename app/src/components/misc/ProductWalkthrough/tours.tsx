import { Rule } from "types";
import { CustomSteps, PointerPlacement } from "./types";
import { generateRuleEditorTour, getTourTarget } from "./utils";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import FEATURES from "config/constants/sub/features";
import { MISC_TOURS } from "./constants";

const tourTooltipPresets = {
  disableBeacon: true,
  offset: 12,
  showNext: true,
  pointerPlacement: PointerPlacement.TOP_50,
};

export const productTours: Record<string, CustomSteps[]> = {
  // TOURS FOR RULE EDITORS STARTS HERE
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
      target: getTourTarget("rule-editor-header-modification-types"),
      title: "Select header modification type",
      content: (
        <>
          Switch between these tabs to modify the Request/Response Headers and select the type of header modification{" "}
          <strong>(add, remove or override)</strong>, you want to perform.{" "}
        </>
      ),
      placement: "top",
      pointerPlacement: PointerPlacement.BOTTOM_0,
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
      content: (
        <>
          This is where the header modification will happen. Search or type the header name you want to{" "}
          <strong>add/override</strong> and type its corresponding value. For <strong>removing</strong> the header just
          type the header name.
        </>
      ),
      placement: "top",
      pointerPlacement: PointerPlacement.BOTTOM_50,
      offset: 18,
      spotlightPadding: 2,
    },
  ]),
  [GLOBAL_CONSTANTS.RULE_TYPES.QUERYPARAM]: generateRuleEditorTour([
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-queryparam-modification-type"),
      title: "Select modification type",
      content: (
        <>
          Select the type of modification you want to do on query params. You can <strong>add/replace</strong> params,{" "}
          <strong>remove specific</strong> param or <strong>remove all</strong> query params from the URL that matches
          the source condition.
        </>
      ),
      placement: "top",
      pointerPlacement: PointerPlacement.BOTTOM_50,
      offset: 18,
    },
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-queryparam-modification-row"),
      title: "Query params Modification",
      content: (
        <>
          This is where the modification will happen. Type the param name you want to add/replace and type its
          corresponding value. For removing a specific param just type the param name. For removing all just select the
          Remove all option from modification menu.
        </>
      ),
      placement: "bottom",
      offset: 18,
    },
  ]),
  [GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE]: [
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-title"),
      title: "Start by adding the “Rule name”",
      content: "Rule name will help you find the rule easily.",
      placement: "bottom-start",
      disableNext: (ruleData: Rule) => !ruleData.name.length,
    },
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-response-resource-type"),
      title: "Select resource type",
      content: (
        <>
          Click here to select between various resource types: <strong>Rest API</strong>, <strong>GraphQL</strong> or{" "}
          <strong>HTML/JS/CSS</strong>.
        </>
      ),
      placement: "bottom-start",
      disableNext: (ruleData: Rule) => !ruleData.pairs[0].response.resourceType.length,
      offset: 0,
      showNext: false,
      autoMoveToNext: true,
    },
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-source"),
      title: "Add Source condition to set criteria for the rules",
      content: `
        You can use URL , Host or Path with Regex,
        Contains, Wildcard or Equals to match the source request.
      `,
      placement: "bottom-start",
      disableNext: (ruleData: Rule) => !ruleData.pairs[0].source.value?.length,
    },
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-response-graphql-payload"),
      title: "Target query and operationName",
      content: `
      You can target GraphQL requests using the operation name in request body. To do so add Paylaod JSON key (eg. operationName) and Value (eg. getUsers)
      `,
      placement: "bottom-start",
      disableNext: (ruleData: Rule) =>
        !ruleData.pairs[0].source.filters[0]?.requestPayload?.key?.length &&
        !ruleData.pairs[0].source.filters[0]?.requestPayload?.value?.length,
    },
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-response-status-code"),
      title: "Select response status code (optional)",
      content:
        "Select the response status code which must be returned with the response. Leave it empty if you want the original status code to be returned.",
      placement: "top",
      pointerPlacement: PointerPlacement.BOTTOM_50,
    },
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-responsebody-types"),
      title: "Select Response override method",
      content: (
        <>
          Select the method to override the response body with <strong>static</strong> data or{" "}
          <strong>programmatically</strong> modify the existing response.
        </>
      ),
      placement: "top",
      pointerPlacement: PointerPlacement.BOTTOM_25,
      offset: 20,
    },
    {
      ...tourTooltipPresets,
      target: getTourTarget("code-editor"),
      title: "Response Body",
      content:
        "For static mode simply define the response body. For programmatic mode override the response data programmatically with JS.",
      placement: "top",
      pointerPlacement: PointerPlacement.BOTTOM_50,
      offset: 16,
      disableNext: (ruleData: Rule) => !ruleData.pairs[0].response.value?.length,
    },
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-create-btn"),
      title: "Save the rule",
      content: "Click here to Create and Save the rule.",
      pointerPlacement: PointerPlacement.TOP_100,
      placement: "bottom-start",
    },
  ],

  [GLOBAL_CONSTANTS.RULE_TYPES.REQUEST]: generateRuleEditorTour([
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-requestbody-types"),
      title: "Select Request override method",
      content: (
        <>
          Select the method to override the API request body with <strong>static</strong> data or{" "}
          <strong>programmatically</strong> modify the existing request payload.
        </>
      ),
      placement: "bottom",
      pointerPlacement: PointerPlacement.TOP_25,

      offset: 20,
    },
    {
      ...tourTooltipPresets,
      target: getTourTarget("code-editor"),
      title: "Request body",
      content:
        "For static mode define the request body which must be passed to the server. For programmatic mode override the request payload programmatically with JS.",
      placement: "top",
      pointerPlacement: PointerPlacement.BOTTOM_50,
      offset: 16,
      disableNext: (ruleData: Rule) => !ruleData.pairs[0].request.value?.length,
    },
  ]),
  [GLOBAL_CONSTANTS.RULE_TYPES.SCRIPT]: generateRuleEditorTour([
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-script-language"),
      title: "Select script language",
      content: (
        <>
          Select the script language <strong>(JavaScript/CSS)</strong> that needs to be inserted.
        </>
      ),
      placement: "top",
      pointerPlacement: PointerPlacement.BOTTOM_50,
      offset: 18,
    },
    {
      ...tourTooltipPresets,
      target: getTourTarget("code-editor"),
      title: "Script",
      content: <>Type the script you want to insert here.</>,
      placement: "top",
      pointerPlacement: PointerPlacement.BOTTOM_50,
      offset: 16,
    },
  ]),
  [GLOBAL_CONSTANTS.RULE_TYPES.REPLACE]: generateRuleEditorTour([
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-replace-from"),
      title: "Replace string",
      content: (
        <>
          Enter the string that needs to be <strong>replaced</strong> from source condition.
        </>
      ),
      placement: "bottom",
      disableNext: (ruleData: Rule) => !ruleData.pairs[0].from?.length,
    },
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-replace-to"),
      title: "Replace with",
      content: <>Add the new string here which you want to replace with.</>,
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
      content: (
        <>
          The delay time <strong>(in milliseconds)</strong> that is applied to the request matching the source
          condition.
        </>
      ),
      offset: 8,
      placement: "bottom-start",
      pointerPlacement: PointerPlacement.TOP_25,
      disableNext: (ruleData: Rule) => !ruleData.pairs[0].delay?.length,
    },
  ]),
  [GLOBAL_CONSTANTS.RULE_TYPES.USERAGENT]: generateRuleEditorTour([
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-useragent-selector"),
      title: "Device/Browser Selector",
      content: (
        <>
          Select whether you want to test on a <strong>device</strong> or a <strong>browser</strong>. select{" "}
          <strong>custom</strong> if you want add your custom user-agent.
        </>
      ),
      offset: 20,
      pointerPlacement: PointerPlacement.BOTTOM_75,
      placement: "top",
      disableNext: (ruleData: Rule) => !ruleData.pairs[0].envType?.length,
    },
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-editor-useragent-type"),
      title: "Select/Type your user-agent",
      content: (
        <>Select or search the type of browser/device or type your own custom user-agent on which you want to test.</>
      ),
      placement: "top",
      pointerPlacement: PointerPlacement.BOTTOM_50,
      disableNext: (ruleData: Rule) => !ruleData.pairs[0].userAgent?.length,
    },
  ]),
  // TOUR FOR RULE EDITORS ENDS HERE

  [FEATURES.DESKTOP_APP_TRAFFIC_TABLE]: [
    {
      ...tourTooltipPresets,
      target: getTourTarget("traffic-table-row"),
      title: "Right-click to modify request, copy cURL and more. Try it now!",
      content: null,
      placement: "bottom",
      showNext: false,
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
      showNext: false,
    },
  ],
  [MISC_TOURS.APP_ENGAGEMENT.FIRST_RULE]: [
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-table-switch-status"),
      title: "Activate/Deactivate rule easily",
      content: "You can switch off the rule in case the rule is not in use.",
      placement: "bottom",
      spotlightPadding: 0,
      offset: 20,
      customNextButtonText: "Got it!",
    },
  ],
  [MISC_TOURS.APP_ENGAGEMENT.FIFTH_RULE]: [
    {
      ...tourTooltipPresets,
      target: getTourTarget("rule-table-create-group-btn"),
      title: "Create groups for the rules",
      content: "Organize your rules into logical groups and enable/disable in one go!",
      placement: "bottom",
      spotlightPadding: 0,
      customNextButtonText: "Got it!",
    },
  ],
};
