import PATHS from "config/constants/sub/paths";
import { TabRoute } from "componentsV2/Tabs/types";
import { DraftRequestContainerTabSource } from "./components/clientView/components/DraftRequestContainer/draftRequestContainerTabSource";
import { RequestViewTabSource } from "./components/clientView/components/RequestView/requestViewTabSource";
import { CollectionViewTabSource } from "./components/clientView/components/Collection/collectionViewTabSource";
import { EnvironmentViewTabSource } from "../environment/components/environmentView/EnvironmentViewTabSource";
import { HistoryViewTabSource } from "./components/clientView/components/request/HistoryView/historyViewTabSource";

export const apiClientTabRoutes: TabRoute[] = [
  {
    path: PATHS.API_CLIENT.ABSOLUTE + "/request/new",
    tabSourceFactory: DraftRequestContainerTabSource.create,
  },
  {
    path: PATHS.API_CLIENT.REQUEST.ABSOLUTE,
    tabSourceFactory: RequestViewTabSource.create,
  },
  {
    path: PATHS.API_CLIENT.HISTORY.ABSOLUTE,
    tabSourceFactory: HistoryViewTabSource.create,
  },
  {
    path: PATHS.API_CLIENT.COLLECTION.ABSOLUTE,
    tabSourceFactory: CollectionViewTabSource.create,
  },
  {
    path: PATHS.API_CLIENT.ENVIRONMENTS.ABSOLUTE,
    tabSourceFactory: EnvironmentViewTabSource.create,
  },
];
