import { PathMatch } from "react-router-dom";
import { CollectionViewTabSource } from "features/apiClient/screens/apiClient/components/clientView/components/Collection/collectionViewTabSource";
import { DraftRequestContainerTabSource } from "features/apiClient/screens/apiClient/components/clientView/components/DraftRequestContainer/draftRequestContainerTabSource";
import { RequestViewTabSource } from "features/apiClient/screens/apiClient/components/clientView/components/RequestView/requestViewTabSource";
import { EnvironmentViewTabSource } from "features/apiClient/screens/environment/components/environmentView/EnvironmentViewTabSource";

export interface TabSourceMetadata {
  id: string;
  title: string;
  name?: string;
  isNewTab?: boolean;
}

export interface MatchedTabSource {
  sourceFactory: TabSourceFactory;
  matchedPath: PathMatch<string>;
}

export interface MatchedTabSource {
  sourceFactory: TabSourceFactory;
  matchedPath: PathMatch<string>;
}

export type TabSource =
  | DraftRequestContainerTabSource
  | RequestViewTabSource
  | CollectionViewTabSource
  | EnvironmentViewTabSource;

export type TabSourceFactory = (matchedPath: MatchedTabSource["matchedPath"]) => TabSource;

export interface TabRoute {
  path: string;
  tabSourceFactory: TabSourceFactory;
}
