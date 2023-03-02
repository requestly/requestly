import {
  redirectToCreateNewRule,
  redirectToSessionRecordingHome,
} from "utils/RedirectionUtils";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { BsCameraVideo } from "react-icons/bs";
import { Feature, SurveyConstants } from "../types";

const allRules = Object.values(RULE_TYPES_CONFIG)
  .filter((ruleConfig) => ruleConfig.ID !== 11 && ruleConfig.ID !== 8)
  .map(({ TYPE, ICON, NAME, DESCRIPTION }): any => {
    return {
      id: NAME,
      title: NAME,
      icon: ICON,
      description: DESCRIPTION,
      action: (navigate: any) => redirectToCreateNewRule(navigate, TYPE),
    };
  });

export const allFeatures: Feature[] = [
  {
    id: "Bug Reporting",
    title: "Bug Reporting",
    icon: () => <BsCameraVideo />,
    description:
      "Capture and replay interactions with a website for debugging and testing purposes.",
    action: (navigate: any) => redirectToSessionRecordingHome(navigate),
  },
  ...allRules,
];

export const recommendation = [
  {
    id: SurveyConstants.FRONTEND,
    recommended: [
      "Redirect Request",
      "Modify Headers",
      "Modify API Response",
      "Insert Scripts",
    ],
  },
  {
    id: SurveyConstants.BACKEND,
    recommended: [
      "Redirect Request",
      "Modify Headers",
      "Modify API Response",
      "Modify Request Body",
    ],
  },
  {
    id: SurveyConstants.QUALITY,
    recommended: [
      "Bug Reporting",
      "Redirect Request",
      "Insert Scripts",
      "Delay Network Requests",
    ],
  },
  {
    id: SurveyConstants.PRODUCT,
    recommended: [
      "Bug Reporting",
      "Insert Scripts",
      "Redirect Request",
      "Replace String",
    ],
  },
  {
    id: SurveyConstants.FOUNDER,
    recommended: [
      "Bug Reporting",
      "Insert Scripts",
      "Redirect Request",
      "Replace String",
    ],
  },
  {
    id: SurveyConstants.MARKETER,
    recommended: [
      "Redirect Request",
      "Replace String",
      "Query Param",
      "Insert Scripts",
    ],
  },
];
