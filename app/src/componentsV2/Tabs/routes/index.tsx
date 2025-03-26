import PATHS from "config/constants/sub/paths";
import { ApiClientEmptyViewSource } from "../hooks/ApiClientEmptyViewSource";

// TODO: move types into "types" file
type ViewSource = ApiClientEmptyViewSource;

export type TabSource = (...args: unknown[]) => ViewSource;

export const tabRoutes: {
  path: string;
  tabSource: TabSource;
}[] = [
  {
    path: PATHS.API_CLIENT.INDEX,
    tabSource: ApiClientEmptyViewSource.create,
  },
];
