import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import { EnvironmentView } from "./EnvironmentView";
import PATHS from "config/constants/sub/paths";
import { MatchedTabSource, TabSourceMetadata } from "componentsV2/Tabs/types";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { getApiClientEnvironmentsStore } from "features/apiClient/commands/store.utils";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

interface EnvironmentViewTabSourceMetadata extends TabSourceMetadata {}

export class EnvironmentViewTabSource extends BaseTabSource {
  constructor(metadata: EnvironmentViewTabSourceMetadata) {
    super();
    this.component = <EnvironmentView key={metadata.id} envId={metadata.id} />;
    this.metadata = {
      ...metadata,
      name: "environments", // FIXME: Its legacy, should be "environment"
    };
    this.urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/${this.metadata.name}/${encodeURI(this.metadata.id)}`;
    this.icon = <MdHorizontalSplit />;
  }

  static create(matchedPath: MatchedTabSource["matchedPath"]): EnvironmentViewTabSource {
    const { envId } = matchedPath.params;

    if (!envId) {
      throw new Error("Environment id not found!");
    }

    return new EnvironmentViewTabSource({ id: envId, title: "Environment", context: {} });
  }

  getIsValidTab(context: ApiClientFeatureContext): boolean {
    const store = getApiClientEnvironmentsStore(context);
    const isExist = store.getState().getEnvironment(this.metadata.id);
    return !!isExist;
  }
}
