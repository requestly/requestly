import APP_CONSTANTS from "config/constants";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { globalActions } from "store/slices/global/slice";
import { AiOutlineFolderOpen } from "@react-icons/all-files/ai/AiOutlineFolderOpen";
import { AiFillYoutube } from "@react-icons/all-files/ai/AiFillYoutube";
import { BsHandbag } from "@react-icons/all-files/bs/BsHandbag";
import { BsCameraVideo } from "@react-icons/all-files/bs/BsCameraVideo";
import { MdOutlineGroupAdd } from "@react-icons/all-files/md/MdOutlineGroupAdd";
import { MdReportGmailerrorred } from "@react-icons/all-files/md/MdReportGmailerrorred";
import { TbArrowsDownUp } from "@react-icons/all-files/tb/TbArrowsDownUp";
import { BiBook } from "@react-icons/all-files/bi/BiBook";
import { BiShuffle } from "@react-icons/all-files/bi/BiShuffle";
import { IoDocumentTextOutline } from "@react-icons/all-files/io5/IoDocumentTextOutline";
import { MdOutlineUploadFile } from "@react-icons/all-files/md/MdOutlineUploadFile";
import { HiOutlineUserGroup } from "@react-icons/all-files/hi/HiOutlineUserGroup";
import { IoPersonAddOutline } from "@react-icons/all-files/io5/IoPersonAddOutline";
import {
  redirectToFileMocksList,
  redirectToMocksList,
  redirectToSessionRecordingHome,
  redirectToSharedList,
  redirectToTemplates,
  redirectToTraffic,
  redirectToUrl,
  redirectToRuleEditor,
  redirectToCreateNewRule,
} from "utils/RedirectionUtils";
import { ActionProps, CommandBarItem, CommandItemType, PageConfig, Page, TitleProps } from "./types";
import { Tag } from "antd";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import "./index.css";

export const config: PageConfig[] = [
  {
    id: Page.HOME,
    items: [
      {
        id: "workspaces",
        type: CommandItemType.GROUP,
        title: "Workspaces",
        children: [
          {
            id: "switch workspace",
            title: "Switch workspace",
            icon: <BiShuffle />,
            action: ({ dispatch }) =>
              dispatch(globalActions.toggleActiveModal({ modalName: "switchWorkspaceModal", newValue: true })),
          },
          {
            id: "join workspace",
            title: "Join workspace",
            icon: <IoPersonAddOutline />,
            action: ({ dispatch }) =>
              dispatch(
                globalActions.toggleActiveModal({
                  modalName: "joinWorkspaceModal",
                  newValue: true,
                  newProps: { source: "command_bar" },
                })
              ),
          },
          {
            id: "create new workspace",
            title: "Create new workspace",
            icon: <HiOutlineUserGroup />,
            action: ({ dispatch }) =>
              dispatch(
                globalActions.toggleActiveModal({
                  modalName: "createWorkspaceModal",
                  newValue: true,
                  newProps: {
                    source: "command_palette",
                  },
                })
              ),
          },
        ],
      },
      {
        id: "rules",
        type: CommandItemType.GROUP,
        title: "Rules",
        children: [
          {
            id: "create new rule",
            title: "Create new rule",
            icon: <MdOutlineGroupAdd />,
            nextPage: Page.NEW_RULES,
          },
          {
            id: "open rule",
            title: ({ rules }: TitleProps) => (rules?.length ? "Open a rule" : null),
            icon: <AiOutlineFolderOpen />,
            nextPage: Page.MY_RULES,
          },
          {
            id: "templates",
            title: "Template rules",
            icon: <BsHandbag />,
            action: ({ navigate }: ActionProps) => {
              redirectToTemplates(navigate);
            },
          },
          {
            id: "shared list",
            title: "Shared lists",
            icon: <MdOutlineGroupAdd />,
            action: ({ navigate }: ActionProps) => {
              redirectToSharedList(navigate);
            },
          },
        ],
      },
      {
        id: "mock api",
        type: CommandItemType.GROUP,
        title: "Mock server",
        children: [
          {
            id: "create mock api",
            title: "Create Mock API endpoint",
            icon: <IoDocumentTextOutline />,
            action: ({ navigate }: ActionProps) => {
              redirectToMocksList(navigate);
            },
          },
          {
            id: "host files",
            title: "Host JS/CSS/HTML files",
            icon: <MdOutlineUploadFile />,
            action: ({ navigate }: ActionProps) => {
              redirectToFileMocksList(navigate);
            },
          },
        ],
      },
      {
        id: "session recording",
        type: CommandItemType.GROUP,
        title: "SessionBook",
        children: [
          {
            id: "record a session",
            title: ({ num_sessions }: TitleProps) => (!num_sessions ? "Record a session" : "View recorded sessions"),
            icon: <BsCameraVideo />,
            action: ({ navigate }: ActionProps) => {
              redirectToSessionRecordingHome(navigate);
            },
          },
        ],
      },
      {
        id: "desktop",
        type: CommandItemType.GROUP,
        title: ({ user, appMode }: TitleProps) =>
          appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? "Desktop App" : null,
        children: [
          {
            id: "traffic table",
            title: "Network Traffic",
            icon: <TbArrowsDownUp />,
            action: ({ navigate }: ActionProps) => {
              redirectToTraffic(navigate);
            },
          },
        ],
      },
      {
        id: "help",
        type: CommandItemType.GROUP,
        title: "Help",
        children: [
          {
            id: "report an issue",
            title: "Report an Issue",
            icon: <MdReportGmailerrorred />,
            action: () => {
              redirectToUrl(APP_CONSTANTS.LINKS.REQUESTLY_GITHUB_ISSUES, true);
            },
          },
          {
            id: "documentation",
            title: "Documentation",
            icon: <BiBook />,
            action: () => {
              redirectToUrl(APP_CONSTANTS.LINKS.REQUESTLY_DOCS, true);
            },
          },
          {
            id: "tutorials",
            title: "Tutorials",
            icon: <AiFillYoutube />,
            action: () => {
              redirectToUrl(APP_CONSTANTS.LINKS.YOUTUBE_TUTORIALS, true);
            },
          },
        ],
      },
    ],
  },
];

/***** Page: New Rule *****/
const newRuleChildren: CommandBarItem[] = Object.values(RULE_TYPES_CONFIG)
  .filter((ruleConfig) => ruleConfig.ID !== 11)
  .map(
    ({ ID, TYPE, ICON, NAME }): CommandBarItem => {
      return {
        id: NAME,
        title: NAME,
        icon: <ICON />,
        action: async ({ navigate, dispatch, user, appMode, rules }) => {
          redirectToCreateNewRule(navigate, TYPE, "command_bar");
        },
      };
    }
  );
const newRuleItems: CommandBarItem[] = [
  {
    id: "new rule",
    type: CommandItemType.GROUP,
    title: "New Rule",
    children: newRuleChildren,
  },
];

const newRulePage: PageConfig = {
  id: Page.NEW_RULES,
  items: newRuleItems,
};

config.push(newRulePage);
/**********/

/***** Page: Open Rule *****/
const userRulesPage: PageConfig = {
  id: Page.MY_RULES,
  items: [],
  itemsFetcher: ({ rules }) => {
    const items: CommandBarItem[] = rules.map(
      (rule: any): CommandBarItem => {
        return {
          id: `${rule?.name}-${rule?.id}`, // Same rule name might exist, which breaks cmdk selection logic
          title: (
            <div className="cmd-user-rule-item">
              <span>{rule?.name}</span>
              <Tag>{APP_CONSTANTS.RULE_TYPES_CONFIG[rule?.ruleType].NAME}</Tag>
            </div>
          ),
          action: ({ navigate }: ActionProps) => {
            redirectToRuleEditor(navigate, rule?.id, "command_bar");
          },
        };
      }
    );

    return items;
  },
};
config.push(userRulesPage);

/**** Page : Switch Workspace *****/
