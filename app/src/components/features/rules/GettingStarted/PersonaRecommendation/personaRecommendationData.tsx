import APP_CONSTANTS from "config/constants";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import PATHS from "config/constants/sub/paths";
import { Document, PaperUpload, Video } from "react-iconly";
import { FeatureSection } from "./types";

const { RULE_TYPES } = GLOBAL_CONSTANTS;
const { RULE_TYPES_CONFIG } = APP_CONSTANTS;

export const personaRecommendationData: FeatureSection[] = [
  {
    section: "URL Rewrites",
    features: [
      {
        title: "Redirect request",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.REDIRECT].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.REDIRECT].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.REDIRECT}`,
      },
      {
        title: "Replace string",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.REPLACE].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.REPLACE].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.REPLACE}`,
      },
      {
        title: "Query params",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.QUERYPARAM].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.QUERYPARAM].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.QUERYPARAM}`,
      },
    ],
  },
  {
    section: "Headers",
    features: [
      {
        title: "Request/Response headers",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.HEADERS].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.HEADERS].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.HEADERS}`,
      },
      {
        title: "User agent",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.USERAGENT].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.USERAGENT].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.USERAGENT}`,
      },
    ],
  },
  {
    section: "API's",
    features: [
      {
        title: "New API end point",
        icon: () => (
          <span className="remix-icon">
            <Document set="curved" />
          </span>
        ),
        subTitle: "Create mocks for your APIs",
        link: PATHS.MOCK_SERVER_V2.ABSOLUTE,
      },
      {
        title: "Modify existing API response",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.RESPONSE].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.RESPONSE].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.RESPONSE}`,
      },
      {
        title: "Modify existing API payload",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.REQUEST].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.REQUEST].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.REQUEST}`,
      },
    ],
  },
  {
    section: "Page HTML",
    features: [
      {
        title: "Inject script",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.SCRIPT].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.SCRIPT].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.SCRIPT}`,
      },
      {
        title: "Replay session",
        icon: () => (
          <span className="remix-icon">
            <Video set="curved" />
          </span>
        ),
        subTitle:
          "Record your browsing sessions along with network and console logs",
        link: PATHS.SESSIONS.ABSOLUTE,
      },
      {
        title: "Host JS/CSS",
        icon: () => (
          <span className="remix-icon">
            <PaperUpload set="curved" />
          </span>
        ),
        subTitle:
          "Host your JS/CSS/HTML files and use them anywhere for debugging",
        link: PATHS.FILE_SERVER_V2.ABSOLUTE,
      },
    ],
  },
  {
    section: "URL blocking and throttles",
    features: [
      {
        title: "Block URL/Pages",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.CANCEL].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.CANCEL].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.CANCEL}`,
      },
      {
        title: "Delay network request",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.DELAY].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.DELAY].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.DELAY}`,
      },
    ],
  },
];
