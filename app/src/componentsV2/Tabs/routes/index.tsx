import PATHS from "config/constants/sub/paths";
import { TabSourceFactory } from "../types";
import { DraftRequestContainerTabSource } from "features/apiClient/screens/apiClient/components/clientView/components/DraftRequestContainer/draftRequestContainerTabSource";
import { RequestViewTabSource } from "features/apiClient/screens/apiClient/components/clientView/components/RequestView/requestViewTabSource";
import { CollectionViewTabSource } from "features/apiClient/screens/apiClient/components/clientView/components/Collection/collectionViewTabSource";
import { EnvironmentViewTabSource } from "features/apiClient/screens/environment/components/environmentView/EnvironmentViewTabSource";

export const tabRoutes: {
  path: string;
  tabSourceFactory: TabSourceFactory;
}[] = [
  {
    path: PATHS.API_CLIENT.ABSOLUTE + "/request/new",
    tabSourceFactory: DraftRequestContainerTabSource.create,
  },
  {
    path: PATHS.API_CLIENT.REQUEST.ABSOLUTE,
    tabSourceFactory: RequestViewTabSource.create,
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
