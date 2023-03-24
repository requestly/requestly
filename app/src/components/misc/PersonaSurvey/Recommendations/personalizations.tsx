import {
  redirectToCreateNewRule,
  redirectToSessionRecordingHome,
  redirectToMocksList,
} from "utils/RedirectionUtils";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { Document, Video } from "react-iconly";
import { Feature, PersonaType } from "../types";

const allRules = Object.values(RULE_TYPES_CONFIG)
  .filter((ruleConfig) => ruleConfig.ID !== 11 && ruleConfig.ID !== 8)
  .map(({ TYPE, ICON, NAME, DESCRIPTION }): any => {
    return {
      id: NAME,
      title: NAME,
      icon: ICON,
      description: DESCRIPTION,
      action: (navigate: any) =>
        redirectToCreateNewRule(navigate, TYPE, "persona_recommendation"),
    };
  });

export const allFeatures: Feature[] = [
  {
    id: "Mock API",
    title: "Mock API",
    icon: () => <Document set="curved" />,
    description:
      "Mock APIs with different status codes, delay, response headers or body.",
    action: (navigate: any) => redirectToMocksList(navigate),
  },
  {
    id: "Bug Reporting",
    title: "Bug Reporting",
    icon: () => <Video set="curved" />,
    description:
      "Capture and replay interactions with a website for debugging and testing purposes.",
    action: (navigate: any) => redirectToSessionRecordingHome(navigate),
  },
  ...allRules,
];

export const recommendation = [
  {
    id: PersonaType.FRONTEND,
    recommended: [
      "Redirect Request",
      "Modify Headers",
      "Modify API Response",
      "Insert Scripts",
    ],
  },
  {
    id: PersonaType.BACKEND,
    recommended: [
      "Redirect Request",
      "Modify Headers",
      "Modify API Response",
      "Modify Request Body",
    ],
  },
  {
    id: PersonaType.QUALITY,
    recommended: [
      "Modify API Response",
      "Redirect Request",
      "Modify Headers",
      "Replace String",
    ],
  },
  {
    id: PersonaType.PRODUCT,
    recommended: [
      "Bug Reporting",
      "Insert Scripts",
      "Redirect Request",
      "Replace String",
    ],
  },
  {
    id: PersonaType.FULLSTACK,
    recommended: [
      "Redirect Request",
      "Modify Headers",
      "Modify API Response",
      "Insert Scripts",
    ],
  },
  {
    id: PersonaType.MARKETER,
    recommended: [
      "Redirect Request",
      "Replace String",
      "Query Param",
      "Insert Scripts",
    ],
  },
];
