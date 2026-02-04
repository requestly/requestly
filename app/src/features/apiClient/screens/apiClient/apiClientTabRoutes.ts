import PATHS from "config/constants/sub/paths";
import { TabRoute } from "componentsV2/Tabs/types";
import { DraftRequestContainerTabSource } from "./components/views/components/DraftRequestContainer/draftRequestContainerTabSource";
import { RequestViewTabSource } from "./components/views/components/RequestView/requestViewTabSource";
import { CollectionViewTabSource } from "./components/views/components/Collection/collectionViewTabSource";
import { EnvironmentViewTabSource } from "../environment/components/environmentView/EnvironmentViewTabSource";
import { HistoryViewTabSource } from "./components/views/components/request/HistoryView/historyViewTabSource";
import { RuntimeVariablesViewTabSource } from "../environment/components/RuntimeVariables/runtimevariablesTabSource";

export const apiClientTabRoutes: TabRoute[] = [
  {
    path: PATHS.API_CLIENT.ABSOLUTE + "/request/new",
    tabSourceFactory: () => DraftRequestContainerTabSource.create(), //For now keep it like this, to avoid passing matchedPaths
  },
  {
    path: PATHS.API_CLIENT.REQUEST.ABSOLUTE,
    tabSourceFactory: RequestViewTabSource.create,
  },
  {
    path: PATHS.API_CLIENT.HISTORY.ABSOLUTE,
    tabSourceFactory: HistoryViewTabSource.create,
    singleton: true,
  },
  {
    path: PATHS.API_CLIENT.COLLECTION.ABSOLUTE,
    tabSourceFactory: CollectionViewTabSource.create,
  },
  {
    path: PATHS.API_CLIENT.ENVIRONMENTS.ABSOLUTE,
    tabSourceFactory: EnvironmentViewTabSource.create,
  },
  {
    path: `${PATHS.API_CLIENT.VARIABLES.ABSOLUTE}/runtime`,
    tabSourceFactory: RuntimeVariablesViewTabSource.create,
  },
];
