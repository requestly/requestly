import APP_CONSTANTS from "config/constants";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { actions } from "store";
import { AiOutlineFolderOpen, AiFillYoutube } from "react-icons/ai";
import { BsHandbag, BsCameraVideo } from "react-icons/bs";
import { MdOutlineGroupAdd, MdReportGmailerrorred } from "react-icons/md";
import { TbArrowsDownUp } from "react-icons/tb";
import { BiBook } from "react-icons/bi";
import { Document, PaperUpload } from "react-iconly";
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
import { isSignUpRequired } from "utils/AuthUtils";
import { ActionProps, CommandBarItem, CommandItemType, PageConfig, Page, TitleProps } from "./types";
import { Tag } from "antd";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { AUTH } from "modules/analytics/events/common/constants";
import "./index.css";

export const config: PageConfig[] = [
  {
    id: Page.HOME,
    items: [
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
        title: "Mocks",
        children: [
          {
            id: "mock api",
            title: "Mock API",
            icon: <Document />,
            action: ({ navigate }: ActionProps) => {
              redirectToMocksList(navigate);
            },
          },
          {
            id: "file server",
            title: "File server",
            icon: <PaperUpload />,
            action: ({ navigate }: ActionProps) => {
              redirectToFileMocksList(navigate);
            },
          },
        ],
      },
      {
        id: "session recording",
        type: CommandItemType.GROUP,
        title: "Session Recording",
        children: [
          {
            id: "record a session",
            title: "Record a session",
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
          if (user.loggedIn) redirectToCreateNewRule(navigate, TYPE, "command_bar");
          else {
            if (await isSignUpRequired(rules, appMode, user))
              dispatch(
                actions.toggleActiveModal({
                  modalName: "authModal",
                  newValue: true,
                  newProps: {
                    callback: () => redirectToCreateNewRule(navigate, TYPE, "command_bar"),
                    authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
                    eventSource: AUTH.SOURCE.COMMAND_BAR,
                  },
                })
              );
            else redirectToCreateNewRule(navigate, TYPE, "command_bar");
          }
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
  itemsFetcher: (rules: any = []) => {
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
