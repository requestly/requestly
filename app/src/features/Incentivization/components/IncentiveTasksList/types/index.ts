import { Dispatch } from "redux";
import { ReactNode } from "react";

export enum IncentiveTask {
  CREATE_FIRST_RULE = "create_first_rule",
  CREATE_PREMIUM_RULE = "create_premium_rule",
  CREATE_A_TEAM_WORKSPACE = "create_a_team_workspace",
  CREATE_MOCK_API = "create_mock_api",
  RECORD_A_SESSION = "record_a_session",
  RATE_ON_CHROME_STORE = "rate_on_chrome_store",
}

export type IncentiveTaskListItem = {
  id: IncentiveTask;
  title: string;
  icon: ReactNode;
  description: string;
  action: ({ navigate, dispatch }: { navigate: unknown; dispatch: Dispatch }) => ReactNode;
  helpLink?: ReactNode;
};
