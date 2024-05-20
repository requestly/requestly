import { IncentiveTask, IncentiveTaskListItem } from "../types";
import { MdPlaylistAdd } from "@react-icons/all-files/md/MdPlaylistAdd";
import { MdOutlineDiversity1 } from "@react-icons/all-files/md/MdOutlineDiversity1";
import { MdOutlineDns } from "@react-icons/all-files/md/MdOutlineDns";
import { PiRecordFill } from "@react-icons/all-files/pi/PiRecordFill";

export const incentiveTasksList: IncentiveTaskListItem[] = [
  {
    id: IncentiveTask.CREATE_FIRST_RULE,
    title: "Create your first rule",
    description:
      "Use rules to intercept & modify network requests, headers, API requests, inject scripts & much more. Upon creating your first rule you will earn $25 Free credits for professional plan.",
    icon: <MdPlaylistAdd />,
    helpLink: {
      text: "Learn how to create Rules",
      url: "https://docs.automatio.co/rules",
    },
  },
  {
    id: IncentiveTask.CREATE_PREMIUM_RULE,
    title: "Create other rules",
    description: "",
    icon: <MdPlaylistAdd />,
    helpLink: {
      text: "Learn how to create Rules",
      url: "https://docs.automatio.co/rules",
    },
  },
  {
    id: IncentiveTask.CREATE_A_TEAM_WORKSPACE,
    title: "Create a Team Workspace ",
    description: "",
    icon: <MdOutlineDiversity1 />,
    helpLink: {
      text: "Learn how to create Team Workspace",
      url: "https://docs.automatio.co/team-workspace",
    },
  },
  {
    id: IncentiveTask.CREATE_API_MOCK,
    title: "Create an API Mock",
    description: "",
    icon: <MdOutlineDns />,
    helpLink: {
      text: "Learn how to create API Mock",
      url: "https://docs.automatio.co/api-mock",
    },
  },
  {
    id: IncentiveTask.RECORD_A_SESSION,
    title: "Record a session",
    description: "Record a session and earn $5 free credits",
    icon: <PiRecordFill />,
    helpLink: {
      text: "Learn how to record a session",
      url: "https://docs.automatio.co/session-recording",
    },
  },
];
