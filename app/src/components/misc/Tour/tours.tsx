//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

export const ProductTours = {
  [GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT]: [
    {
      target: ".editor-title-name-wrapper .ant-input-borderless",
      title: "Start by adding the “Rule name”",
      content: "Rule name will help you find the rule easily.",
      disableBeacon: true,
      offset: 0,
    },
    {
      target: ".rules-pair-content-header",
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
      offset: 0,
    },
    {
      target: ".ant-input-group .ant-input",
      title: "Add Destination URL",
      content:
        "The destination to which the users will be redirected to based on the source condition",
      disableBeacon: true,
      offset: 0,
    },
    {
      target: ".rule-editor-header-action-btns .ant-btn-primary",
      title: "Save the rule",
      content: "Click here to Create and Save the rule.",
      disableBeacon: true,
      offset: 0,
    },
  ],
};
