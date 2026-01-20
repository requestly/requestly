import { CollectionViewTabSource } from "features/apiClient/screens/apiClient/components/views/components/Collection/collectionViewTabSource";
import { DraftRequestContainerTabSource } from "features/apiClient/screens/apiClient/components/views/components/DraftRequestContainer/draftRequestContainerTabSource";
import { RequestViewTabSource } from "features/apiClient/screens/apiClient/components/views/components/RequestView/requestViewTabSource";
import { HistoryViewTabSource } from "features/apiClient/screens/apiClient/components/views/components/request/HistoryView/historyViewTabSource";
import { EnvironmentViewTabSource } from "features/apiClient/screens/environment/components/environmentView/EnvironmentViewTabSource";

export const TAB_SOURCES_MAP = {
  [DraftRequestContainerTabSource.name]: DraftRequestContainerTabSource,
  [RequestViewTabSource.name]: RequestViewTabSource,
  [HistoryViewTabSource.name]: HistoryViewTabSource,
  [CollectionViewTabSource.name]: CollectionViewTabSource,
  [EnvironmentViewTabSource.name]: EnvironmentViewTabSource,
};
