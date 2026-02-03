import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import PATHS from "config/constants/sub/paths";
import { MatchedTabSource, TabSourceMetadata } from "componentsV2/Tabs/types";
import { HistoryView } from "./HistoryView";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";
import { getApiClientFeatureContext } from "features/apiClient/slices";

export class HistoryViewTabSource extends BaseTabSource {
  metadata: TabSourceMetadata;

  constructor(metadata: Pick<TabSourceMetadata, "context">) {
    super();
    this.component = <HistoryView />;
    this.metadata = {
      id: "history",
      name: "history",
      title: "History",
      ...metadata,
    };
    this.urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/${this.metadata.name}`;
    this.icon = <MdOutlineHistory />;
  }

  static create(matchedPath: MatchedTabSource["matchedPath"]): HistoryViewTabSource {
    const ctx = getApiClientFeatureContext();
    return new HistoryViewTabSource({
      context: {
        id: ctx.workspaceId,
      },
    });
  }
}
