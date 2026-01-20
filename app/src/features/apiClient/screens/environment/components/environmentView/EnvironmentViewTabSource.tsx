import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import { MatchedTabSource, TabSourceMetadata } from "componentsV2/Tabs/types";
import PATHS from "config/constants/sub/paths";
import { getApiClientFeatureContext } from "features/apiClient/slices";
import { GLOBAL_ENVIRONMENT_ID } from "features/apiClient/slices/common/constants";
import { EnvironmentViewManager } from "./EnvironmentViewManager";

interface EnvironmentViewTabSourceMetadata extends TabSourceMetadata {
  isGlobal: boolean;
}

export class EnvironmentViewTabSource extends BaseTabSource {
  metadata: EnvironmentViewTabSourceMetadata;
  constructor(metadata: EnvironmentViewTabSourceMetadata) {
    super();
    this.component = <EnvironmentViewManager key={metadata.id} envId={metadata.id} isGlobal={metadata.isGlobal} />;
    this.metadata = {
      ...metadata,
      name: "environments", // FIXME: Its legacy, should be "environment"
    };
    this.urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/${this.metadata.name}/${encodeURI(this.metadata.id)}`;
    this.icon = <MdHorizontalSplit />;
  }

  static create(matchedPath: MatchedTabSource["matchedPath"]): EnvironmentViewTabSource {
    const { envId } = matchedPath.params;
    const ctx = getApiClientFeatureContext();

    if (!envId) {
      throw new Error("Environment id not found!");
    }

    return new EnvironmentViewTabSource({
      id: envId,
      title: "Environment",
      context: { id: ctx.workspaceId },
      isGlobal: envId === GLOBAL_ENVIRONMENT_ID,
    });
  }
}
