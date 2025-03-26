import PATHS from "config/constants/sub/paths";
import { ApiClientEmptyViewSource } from "../hooks/ApiClientEmptyViewSource";

// TODO: move types into "types" file
type ViewSource = ApiClientEmptyViewSource;

export type TabSourceFactory = (...args: unknown[]) => ViewSource;

export const tabRoutes: {
  path: string;
  tabSourceFactory: TabSourceFactory;
}[] = [
  {
    // path: PATHS.API_CLIENT.INDEX,
    path: PATHS.API_CLIENT.REQUEST.ABSOLUTE,
    tabSourceFactory: ApiClientEmptyViewSource.create,
  },
];
