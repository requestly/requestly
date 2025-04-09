import { CollectionViewTabSource } from "features/apiClient/screens/apiClient/components/clientView/components/Collection/collectionViewTabSource";
import { DraftRequestContainerTabSource } from "features/apiClient/screens/apiClient/components/clientView/components/DraftRequestContainer/draftRequestContainerTabSource";
import { HistoryViewTabSource } from "features/apiClient/screens/apiClient/components/clientView/components/request/HistoryView/historyViewTabSource";
import { RequestViewTabSource } from "features/apiClient/screens/apiClient/components/clientView/components/RequestView/requestViewTabSource";
import { EnvironmentViewTabSource } from "features/apiClient/screens/environment/components/environmentView/EnvironmentViewTabSource";

export const TAB_SOURCES_MAP = {
  [DraftRequestContainerTabSource.name]: DraftRequestContainerTabSource,
  [RequestViewTabSource.name]: RequestViewTabSource,
  [HistoryViewTabSource.name]: HistoryViewTabSource,
  [CollectionViewTabSource.name]: CollectionViewTabSource,
  [EnvironmentViewTabSource.name]: EnvironmentViewTabSource,
};
