import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import PATHS from "config/constants/sub/paths";
import { ExampleRequestView } from "./ExampleRequestView";
import { RQAPI } from "features/apiClient/types";
import { MatchedTabSource, TabSourceMetadata } from "componentsV2/Tabs/types";
import { getApiClientFeatureContext } from "features/apiClient/slices";
import { MdOutlineDashboardCustomize } from "@react-icons/all-files/md/MdOutlineDashboardCustomize";

interface ExampleViewTabSourceMetadata extends TabSourceMetadata {
  apiEntryDetails?: RQAPI.ExampleApiRecord;
}

export class ExampleViewTabSource extends BaseTabSource {
  constructor(metadata: ExampleViewTabSourceMetadata) {
    super();
    this.component = <ExampleRequestView key={metadata.id} exampleId={metadata.id} />;
    this.metadata = {
      ...metadata,
      name: "example",
    };
    this.urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/${this.metadata.name}/${encodeURI(this.metadata.id)}`;
    this.icon = <MdOutlineDashboardCustomize />;
  }

  static create(matchedPath: MatchedTabSource["matchedPath"]): ExampleViewTabSource {
    const { exampleId } = matchedPath.params;
    const ctx = getApiClientFeatureContext();

    if (!exampleId) {
      throw new Error("Example id not found!");
    }

    return new ExampleViewTabSource({ id: exampleId, title: "Example", context: { id: ctx.workspaceId } });
  }
}
