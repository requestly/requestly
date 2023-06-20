import APP_CONSTANTS from "config/constants";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import PATHS from "config/constants/sub/paths";
import { Document, PaperUpload, Video } from "react-iconly";
import { FeatureSection } from "./types";
import { ApiOutlined } from "@ant-design/icons";

const { RULE_TYPES } = GLOBAL_CONSTANTS;
const { RULE_TYPES_CONFIG } = APP_CONSTANTS;

export const personaRecommendationData: FeatureSection[] = [
  {
    section: "URL Rewrites",
    features: [
      {
        id: "redirect_request",
        title: "Redirect request",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.REDIRECT].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.REDIRECT].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.REDIRECT}`,
      },
      {
        id: "replace_string",
        title: "Replace string",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.REPLACE].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.REPLACE].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.REPLACE}`,
      },
      {
        id: "query_params",
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
        id: "request_response_headers",
        title: "Request/Response headers",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.HEADERS].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.HEADERS].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.HEADERS}`,
      },
      {
        id: "user_agent",
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
        id: "new_api_end_point",
        title: "New API endpoint",
        icon: () => (
          <span className="remix-icon">
            <Document set="curved" />
          </span>
        ),
        subTitle: "Create mocks for your APIs",
        link: PATHS.MOCK_SERVER_V2.ABSOLUTE,
      },
      {
        id: "modify_existing_api_response",
        title: "Modify existing API response",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.RESPONSE].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.RESPONSE].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.RESPONSE}`,
      },
      {
        id: "modify_existing_api_payload",
        title: "Modify existing API payload",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.REQUEST].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.REQUEST].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.REQUEST}`,
        disabled: true,
      },
      {
        id: "test_api_endpoints",
        title: "Test API endpoints",
        icon: () => <ApiOutlined />,
        subTitle: "Test responses quickly using API Client",
        link: PATHS.API_CLIENT.ABSOLUTE,
      },
    ],
  },
  {
    section: "Page HTML",
    features: [
      {
        id: "inject_script",
        title: "Inject script",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.SCRIPT].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.SCRIPT].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.SCRIPT}`,
      },
      {
        id: "replay_session",
        title: "Replay session",
        icon: () => (
          <span className="remix-icon">
            <Video set="curved" />
          </span>
        ),
        subTitle: "Record your browsing sessions along with network and console logs",
        link: PATHS.SESSIONS.ABSOLUTE,
      },
      {
        id: "host_js_css",
        title: "Host JS/CSS",
        icon: () => (
          <span className="remix-icon">
            <PaperUpload set="curved" />
          </span>
        ),
        subTitle: "Host your JS/CSS/HTML files and use them anywhere for debugging",
        link: PATHS.FILE_SERVER_V2.ABSOLUTE,
      },
    ],
  },
  {
    section: "URL blocking and throttles",
    features: [
      {
        id: "block_url_pages",
        title: "Block URL/Pages",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.CANCEL].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.CANCEL].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.CANCEL}`,
      },
      {
        id: "delay_network_request",
        title: "Delay network request",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.DELAY].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.DELAY].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.DELAY}`,
      },
    ],
  },
];
