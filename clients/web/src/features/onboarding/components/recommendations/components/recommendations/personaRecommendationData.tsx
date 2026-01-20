import APP_CONSTANTS from "config/constants";
import PATHS from "config/constants/sub/paths";
import { FeatureSection, FeatureReleaseTag } from "./types";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { FiVideo } from "@react-icons/all-files/fi/FiVideo";
import { IoDocumentTextOutline } from "@react-icons/all-files/io5/IoDocumentTextOutline";
import { ApiOutlined } from "@ant-design/icons";

const { RULE_TYPES } = GLOBAL_CONSTANTS;
const { RULE_TYPES_CONFIG } = APP_CONSTANTS;

export const personaRecommendationData: FeatureSection[] = [
  {
    section: "Modify HTTP Requests",
    features: [
      {
        id: "redirect_request",
        title: "Redirect request",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.REDIRECT].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.REDIRECT].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.REDIRECT}`,
      },
      {
        id: "modify_existing_api_response",
        title: "Modify API response",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.RESPONSE].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.RESPONSE].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.RESPONSE}`,
      },
      {
        id: "request_response_headers",
        title: "Modify HTTP headers",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.HEADERS].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.HEADERS].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.HEADERS}`,
      },
      {
        id: "replace_string",
        title: "Replace string",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.REPLACE].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.REPLACE].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.REPLACE}`,
      },
      {
        id: "modify_existing_api_payload",
        title: "Modify request body",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.REQUEST].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.REQUEST].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.REQUEST}`,
      },
      {
        id: "insert_script",
        title: "Insert script",
        icon: RULE_TYPES_CONFIG[RULE_TYPES.SCRIPT].ICON,
        subTitle: RULE_TYPES_CONFIG[RULE_TYPES.SCRIPT].DESCRIPTION,
        link: `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_TYPES.SCRIPT}`,
      },
    ],
  },
  {
    section: "Others",
    features: [
      {
        id: "record_session",
        title: "Record a session",
        icon: () => <FiVideo />,
        subTitle: "Record your browsing sessions along with network and console logs",
        link: PATHS.SESSIONS.ABSOLUTE,
        tag: FeatureReleaseTag.NEW,
      },
      {
        id: "new_api_end_point",
        title: "New API endpoint",
        icon: () => <IoDocumentTextOutline />,
        subTitle: "Create mocks for your APIs",
        link: PATHS.MOCK_SERVER_V2.ABSOLUTE,
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
];
