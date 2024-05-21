import { IncentiveTask, IncentiveTaskListItem } from "../types";
import { MdPlaylistAdd } from "@react-icons/all-files/md/MdPlaylistAdd";
import { MdOutlineDiversity1 } from "@react-icons/all-files/md/MdOutlineDiversity1";
import { MdOutlineDns } from "@react-icons/all-files/md/MdOutlineDns";
import { PiRecordFill } from "@react-icons/all-files/pi/PiRecordFill";
import { NewRuleButtonWithDropdown } from "features/rules/screens/rulesList/components/RulesList/components";
import { Button } from "antd";
import { redirectToMocks, redirectToSessionRecordingHome } from "utils/RedirectionUtils";
import { actions } from "store";

// TODO: ADD HELP LINKS
export const incentiveTasksList: IncentiveTaskListItem[] = [
  {
    id: IncentiveTask.CREATE_FIRST_RULE,
    title: "Create your first rule",
    description:
      "Use rules to intercept & modify network requests, headers, API requests, inject scripts & much more. Upon creating your first rule you will earn $25 Free credits for professional plan.",
    icon: <MdPlaylistAdd />,
    action: () => <NewRuleButtonWithDropdown />,
    helpLink: <a href="#">Learn how to create Rules</a>,
  },
  {
    id: IncentiveTask.CREATE_PREMIUM_RULE,
    title: "Create other rules",
    description:
      "Use rules to intercept & modify network requests, headers, API requests, inject scripts & much more. Upon creating your first rule you will earn $25 Free credits for professional plan.",
    icon: <MdPlaylistAdd />,
    action: () => <NewRuleButtonWithDropdown />,
    helpLink: <a href="#">Learn how to create Rules</a>,
  },
  {
    id: IncentiveTask.CREATE_A_TEAM_WORKSPACE,
    title: "Create a Team Workspace ",
    description:
      "Team Workspaces let you share your debugging workflows with your teammates in real time. Everyone can collaborate on things like Rules, Mock APIs and Session replays.",
    icon: <MdOutlineDiversity1 />,
    action: ({ dispatch }) => (
      <Button
        type="primary"
        onClick={() =>
          dispatch(
            // @ts-ignore
            actions.toggleActiveModal({
              modalName: "createWorkspaceModal",
              newValue: true,
              newProps: {
                callback: () => {
                  // @ts-ignore
                  dispatch(actions.updateJoinWorkspaceCardVisible(false));
                },
                source: "join_workspace_card",
              },
            })
          )
        }
      >
        Create a new workspace
      </Button>
    ),
    helpLink: <a href="#">Learn how to create Team Workspace</a>,
  },

  {
    id: IncentiveTask.CREATE_API_MOCK,
    title: "Create an API Mock",
    description: "Create mocks for your APIs with different status codes, delay, response headers or body",
    icon: <MdOutlineDns />,
    action: ({ navigate }) => (
      <Button type="primary" onClick={() => redirectToMocks(navigate)}>
        Create a mock API
      </Button>
    ),

    helpLink: <a href="#">Learn how to create API Mock</a>,
  },
  {
    id: IncentiveTask.RECORD_A_SESSION,
    title: "Record a session",
    description:
      "Session replays allows you to capture, report, and debug errors with the power of session replay and network & console logs.",
    icon: <PiRecordFill />,
    action: ({ navigate }) => (
      <Button type="primary" onClick={() => redirectToSessionRecordingHome(navigate)}>
        Record a session
      </Button>
    ),
    helpLink: <a href="#">Learn how to record a session</a>,
  },
];
