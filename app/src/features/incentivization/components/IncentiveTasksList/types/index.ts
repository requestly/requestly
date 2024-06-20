import { Dispatch } from "redux";
import { ReactNode } from "react";
import { IncentivizeEvent, Milestone } from "features/incentivization/types";

export type IncentiveTaskListItem = {
  id: IncentivizeEvent;
  title: string;
  icon: ReactNode;
  description: string;
  action: ({ navigate, dispatch }: { navigate: unknown; dispatch: Dispatch }) => ReactNode;
  helpLink?: ReactNode;
  isCompleted: boolean;
  milestone: Milestone;
};
